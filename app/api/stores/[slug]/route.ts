
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { getSubscriptionInfo } from "@/lib/subscription";

// GET: consulta pública de la tienda
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const store = await prisma.store.findUnique({
      where: { slug },
      include: { products: true }
    });

    if (!store) {
      return NextResponse.json(
        { error: "No encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error("Error al consultar tienda:", error);

    return NextResponse.json(
      { error: "Error al consultar tienda" },
      { status: 500 }
    );
  }
}

// PUT: actualización protegida de la tienda
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. Verificar sesión
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Sesión inválida" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    // 2. Comprobar que la tienda pertenezca al usuario
    const store = await prisma.store.findFirst({
      where: {
        slug,
        userId: data.user.id
      }
    });

    if (!store) {
      return NextResponse.json(
        { error: "No tenés permiso para modificar esta tienda" },
        { status: 403 }
      );
    }

    // 3. Verificar suscripción
    const subscription = getSubscriptionInfo(store);

    if (!subscription.canManage) {
      return NextResponse.json(
        { error: "Tu suscripción no permite modificar la tienda. Renovala para continuar." },
        { status: 403 }
      );
    }

    // 4. Validar los datos recibidos
    const body = await req.json();

    const updateData: {
      template?: string;
      logoUrl?: string | null;
    } = {};

    if (body.template !== undefined) {
      if (typeof body.template !== "string" || !body.template.trim()) {
        return NextResponse.json(
          { error: "Diseño inválido" },
          { status: 400 }
        );
      }

      updateData.template = body.template.trim();
    }

    if (body.logoUrl !== undefined) {
      if (
        body.logoUrl !== null &&
        typeof body.logoUrl !== "string"
      ) {
        return NextResponse.json(
          { error: "Logo inválido" },
          { status: 400 }
        );
      }

      updateData.logoUrl =
        typeof body.logoUrl === "string"
          ? body.logoUrl.trim()
          : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No hay datos para actualizar" },
        { status: 400 }
      );
    }

    // 5. Actualizar tienda
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: updateData
    });

    return NextResponse.json(updatedStore);

  } catch (error) {
    console.error("Error al actualizar tienda:", error);

    return NextResponse.json(
      { error: "Error al actualizar tienda" },
      { status: 500 }
    );
  }
}
