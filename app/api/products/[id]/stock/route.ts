import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { getSubscriptionInfo } from "@/lib/subscription";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const { delta } = body; // 👈 Cuánto sumar o restar (+1 o -1)

    if (typeof delta !== "number" || !Number.isInteger(delta) || delta === 0) {
      return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
    }

    // Verificar que el producto pertenezca al usuario y traer la suscripción
    const product = await prisma.product.findFirst({
      where: {
        id,
        store: { userId: data.user.id }
      },
      include: { store: true }
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const subscription = getSubscriptionInfo(product.store);
    if (!subscription.canManage) {
      return NextResponse.json({ error: "Tu suscripción no permite modificar productos" }, { status: 403 });
    }

    // Validar que no quede stock negativo
    if (product.stock + delta < 0) {
      return NextResponse.json({ error: "El stock no puede ser menor a 0" }, { status: 400 });
    }

    // Actualizar solo el stock
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stock: product.stock + delta }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}