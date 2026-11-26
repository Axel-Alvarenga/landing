import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

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

    // 2. Buscar el campo y verificar que pertenezca a una tienda del usuario
    const field = await prisma.customField.findFirst({
      where: {
        id,
        store: { userId: data.user.id }
      }
    });

    if (!field) {
      return NextResponse.json({ error: "Campo no encontrado o sin permisos" }, { status: 404 });
    }

    // 3. 👇 VERIFICAR SI TIENE VALORES ASIGNADOS
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