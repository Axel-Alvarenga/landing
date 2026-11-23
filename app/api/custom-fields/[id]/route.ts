
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { getSubscriptionInfo } from "@/lib/subscription";

async function getAuthenticatedUser(req: Request) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;

  return data.user;
}

async function getManageableField(id: string, userId: string) {
  const field = await prisma.customField.findFirst({
    where: {
      id,
      store: { userId }
    },
    include: {
      store: true
    }
  });

  if (!field) {
    return { field: null, error: "Campo no encontrado" };
  }

  const subscription = getSubscriptionInfo(field.store);

  if (!subscription.canManage) {
    return {
      field: null,
      error: "Tu suscripción no permite administrar campos"
    };
  }

  return { field, error: null };
}

// EDITAR CAMPO
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const { name, type, options, required, showInStore, sortOrder } = body;

    const result = await getManageableField(id, user.id);

    if (!result.field) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes("suscripción") ? 403 : 404 }
      );
    }

    const validTypes = ["TEXT", "NUMBER", "SELECT", "DATE", "CHECKBOX"];

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !validTypes.includes(type)
    ) {
      return NextResponse.json(
        { error: "Datos del campo inválidos" },
        { status: 400 }
      );
    }

    const normalizedOptions = type === "SELECT"
      ? Array.isArray(options)
        ? [...new Set(options.filter(
            (option: unknown) =>
              typeof option === "string" && option.trim()
          ).map((option: string) => option.trim()))]
        : []
      : [];

    if (type === "SELECT" && normalizedOptions.length === 0) {
      return NextResponse.json(
        { error: "Agregá al menos una opción" },
        { status: 400 }
      );
    }

    const updatedField = await prisma.customField.update({
      where: { id },
      data: {
        name: name.trim(),
        type,
        options: normalizedOptions,
        required: required === true,
        showInStore: showInStore === true,
        ...(Number.isInteger(sortOrder) ? { sortOrder } : {})
      }
    });

    return NextResponse.json(updatedField);
  } catch (error: any) {
    console.error("Error editando campo:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un campo con ese nombre" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error al editar campo" },
      { status: 500 }
    );
  }
}

// ELIMINAR CAMPO
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const result = await getManageableField(id, user.id);

    if (!result.field) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes("suscripción") ? 403 : 404 }
      );
    }

    await prisma.customField.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando campo:", error);

    return NextResponse.json(
      { error: "Error al eliminar campo" },
      { status: 500 }
    );
  }
}
