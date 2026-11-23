
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { getSubscriptionInfo } from "@/lib/subscription";

async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return null;

  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data.user) return null;

  return data.user;
}

const allowedTypes = ["TEXT", "NUMBER", "SELECT", "DATE", "CHECKBOX"];

// LISTAR CAMPOS PERSONALIZADOS
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const store = await prisma.store.findFirst({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!store) {
      return NextResponse.json(
        { error: "Tienda no encontrada" },
        { status: 404 }
      );
    }

    const fields = await prisma.customField.findMany({
      where: { storeId: store.id },
      orderBy: { sortOrder: "asc" }
    });

    return NextResponse.json(fields);

  } catch (error) {
    console.error("Error al listar campos:", error);

    return NextResponse.json(
      { error: "Error al cargar los campos personalizados" },
      { status: 500 }
    );
  }
}

// CREAR CAMPO PERSONALIZADO
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      storeId,
      name,
      type,
      options,
      required,
      showInStore,
      sortOrder
    } = body;

    if (
      typeof storeId !== "string" ||
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 50 ||
      !allowedTypes.includes(type)
    ) {
      return NextResponse.json(
        { error: "Datos del campo inválidos" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: user.id
      }
    });

    if (!store) {
      return NextResponse.json(
        { error: "Tienda no encontrada o sin permisos" },
        { status: 404 }
      );
    }

    const subscription = getSubscriptionInfo(store);

    if (!subscription.canManage) {
      return NextResponse.json(
        { error: "Tu suscripción no permite administrar campos." },
        { status: 403 }
      );
    }

    const normalizedOptions =
      type === "SELECT"
        ? options
        : [];

    if (
      type === "SELECT" &&
      (
        !Array.isArray(normalizedOptions) ||
        normalizedOptions.length === 0 ||
        normalizedOptions.some(
          (option: any) =>
            typeof option !== "string" ||
            !option.trim() ||
            option.length > 50
        )
      )
    ) {
      return NextResponse.json(
        { error: "Debés agregar opciones válidas para este campo." },
        { status: 400 }
      );
    }

    const cleanOptions = normalizedOptions.map(
      (option: string) => option.trim()
    );

    if (new Set(cleanOptions).size !== cleanOptions.length) {
      return NextResponse.json(
        { error: "No podés repetir opciones." },
        { status: 400 }
      );
    }

    const field = await prisma.customField.create({
      data: {
        name: name.trim(),
        type,
        options: cleanOptions,
        required: required === true,
        showInStore: showInStore === true,
        sortOrder: Number.isInteger(sortOrder) ? sortOrder : 0,
        storeId: store.id
      }
    });

    return NextResponse.json(field, { status: 201 });

  } catch (error: any) {
    console.error("Error al crear campo:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un campo con ese nombre en tu tienda." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear el campo personalizado" },
      { status: 500 }
    );
  }
}
