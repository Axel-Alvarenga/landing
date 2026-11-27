import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { getSubscriptionInfo } from "@/lib/subscription";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verificar sesión
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data.user) return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    // 2. Buscar el campo y verificar que pertenezca a una tienda del usuario
    const field = await prisma.customField.findFirst({
      where: {
        id,
        store: { userId: data.user.id }
      },
      include: { store: true }
    });

    if (!field) {
      return NextResponse.json({ error: "Campo no encontrado o sin permisos" }, { status: 404 });
    }

    // 3. Verificar suscripción
    const subscription = getSubscriptionInfo(field.store);
    if (!subscription.canManage) {
      return NextResponse.json({ error: "Tu suscripción no permite modificar campos" }, { status: 403 });
    }

    // 4. Validar datos
    const { name, type, options, required, showInStore } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const validTypes = ["TEXT", "NUMBER", "SELECT", "DATE", "CHECKBOX"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Tipo de dato inválido" }, { status: 400 });
    }

    if (type === "SELECT" && (!Array.isArray(options) || options.length === 0)) {
      return NextResponse.json({ error: "Las opciones son obligatorias para este tipo" }, { status: 400 });
    }

    // 5. Actualizar campo
    const updatedField = await prisma.customField.update({
      where: { id },
      data: {
        name: name.trim(),
        type,
        options: type === "SELECT" ? options : [],
        required: Boolean(required),
        showInStore: Boolean(showInStore),
      }
    });

    return NextResponse.json(updatedField);

  } catch (error) {
    console.error("Error al actualizar campo:", error);
    
    // Si el nombre ya existe en la tienda, Prisma tira un error P2002
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un campo con ese nombre en tu tienda" }, { status: 409 });
    }

    return NextResponse.json({ error: "Error al actualizar el campo" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verificar sesión
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data.user) return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });

    const { id } = await params;

    // 2. Buscar el campo y verificar que pertenezca al usuario
    const field = await prisma.customField.findFirst({
      where: {
        id,
        store: { userId: data.user.id }
      }
    });

    if (!field) {
      return NextResponse.json({ error: "Campo no encontrado o sin permisos" }, { status: 404 });
    }

    // 3. Verificar si tiene valores asignados
    const assignedValuesCount = await prisma.productCustomFieldValue.count({
      where: { fieldId: id }
    });

    if (assignedValuesCount > 0) {
      return NextResponse.json(
        { 
          error: "No se puede eliminar el campo porque está asignado a uno o más productos. Primero quitá el valor de esos productos." 
        },
        { status: 409 } // 409 Conflict
      );
    }

    // 4. Si no tiene valores, eliminar
    await prisma.customField.delete({ where: { id } });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error al eliminar campo:", error);
    return NextResponse.json({ error: "Error al eliminar el campo" }, { status: 500 });
  }
}