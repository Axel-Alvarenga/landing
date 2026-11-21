
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (status !== "SOLD" && status !== "CANCELLED") {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    // Verificamos la sesión del usuario
    const authorization = req.headers.get("Authorization");
    const token = authorization?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesión inválida" },
        { status: 401 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          items: true,
          store: true
        }
      });

      if (!order || order.store.userId !== user.id) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (order.status === "CANCELLED") {
        throw new Error("ORDER_ALREADY_CANCELLED");
      }

      if (order.status === status) {
        throw new Error("ORDER_ALREADY_UPDATED");
      }

      // Si se confirma como vendido, descontamos el stock
      if (status === "SOLD") {
        for (const item of order.items) {
          if (!item.productId) {
            throw new Error("PRODUCT_NOT_FOUND");
          }

          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              storeId: order.storeId,
              stock: { gte: item.quantity }
            },
            data: {
              stock: { decrement: item.quantity }
            }
          });

          if (updated.count !== 1) {
            throw new Error("INSUFFICIENT_STOCK");
          }
        }
      }

      // Si una venta ya confirmada se cancela,
      // devolvemos las unidades al inventario
      if (status === "CANCELLED" && order.status === "SOLD") {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.updateMany({
              where: {
                id: item.productId,
                storeId: order.storeId
              },
              data: {
                stock: { increment: item.quantity }
              }
            });
          }
        }
      }

      return await tx.order.update({
        where: { id },
        data: {
          status,
          soldAt: status === "SOLD" ? new Date() : null,
          cancelledAt: status === "CANCELLED" ? new Date() : null
        }
      });
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error al actualizar pedido:", error);

    const messages: Record<string, string> = {
      ORDER_NOT_FOUND: "Pedido no encontrado o sin autorización",
      ORDER_ALREADY_CANCELLED: "El pedido ya está cancelado",
      ORDER_ALREADY_UPDATED: "El pedido ya tiene ese estado",
      INSUFFICIENT_STOCK: "No hay suficiente stock para completar la venta",
      PRODUCT_NOT_FOUND: "Uno de los productos ya no existe"
    };

    if (error instanceof Error && messages[error.message]) {
      const statusCode =
        error.message === "ORDER_NOT_FOUND" ? 404 :
        error.message === "INSUFFICIENT_STOCK" ? 409 : 400;

      return NextResponse.json(
        { error: messages[error.message] },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: "No se pudo actualizar el pedido" },
      { status: 500 }
    );
  }
}
