
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { getSubscriptionInfo } from "@/lib/subscription";

async function getAuthenticatedUser(req: Request) {
  const authorization = req.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice(7);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

// POST: registrar un pedido desde la tienda pública
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { storeSlug, customerName, paymentMethod, items } = body;

    if (
      typeof storeSlug !== "string" ||
      !storeSlug.trim() ||
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof paymentMethod !== "string" ||
      !paymentMethod.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Datos del pedido inválidos" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return NextResponse.json(
        { error: "No se encontró la tienda" },
        { status: 404 }
      );
    }

    // Verificar si la tienda puede recibir pedidos
    const subscription = getSubscriptionInfo(store);

    if (!subscription.canReceiveOrders) {
      return NextResponse.json(
        { error: "Esta tienda no está habilitada para recibir pedidos" },
        { status: 403 }
      );
    }

    // Agrupar productos repetidos y validar cantidades
    const quantities = new Map<string, number>();

    for (const item of items) {
      if (
        typeof item.productId !== "string" ||
        !item.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          { error: "Producto o cantidad inválida" },
          { status: 400 }
        );
      }

      quantities.set(
        item.productId,
        (quantities.get(item.productId) || 0) + item.quantity
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const productIds = Array.from(quantities.keys());

      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          storeId: store.id
        }
      });

      if (products.length !== productIds.length) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      let total = 0;

      const orderItems = products.map((product) => {
        const quantity = quantities.get(product.id)!;

        if (product.stock < quantity) {
          throw new Error("INSUFFICIENT_STOCK");
        }

        const subtotal = product.price * quantity;
        total += subtotal;

        return {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity,
          subtotal
        };
      });

      return await tx.order.create({
        data: {
          customerName: customerName.trim(),
          paymentMethod: paymentMethod.trim(),
          total,
          storeId: store.id,
          items: {
            create: orderItems
          }
        },
        include: {
          items: true
        }
      });
    });

    return NextResponse.json(order, { status: 201 });

  } catch (error) {
    console.error("Error al registrar pedido:", error);

    if (error instanceof Error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return NextResponse.json(
          { error: "Uno o más productos no existen en esta tienda" },
          { status: 404 }
        );
      }

      if (error.message === "INSUFFICIENT_STOCK") {
        return NextResponse.json(
          { error: "No hay stock suficiente para uno de los productos" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "No se pudo registrar el pedido" },
      { status: 500 }
    );
  }
}

// GET: obtener los pedidos de la tienda del usuario autenticado
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
      where: { userId: user.id }
    });

    if (!store) {
      return NextResponse.json(
        { error: "No se encontró tu tienda" },
        { status: 404 }
      );
    }

    // El panel no puede consultar pedidos durante GRACE o EXPIRED
    const subscription = getSubscriptionInfo(store);

    if (!subscription.canManage) {
      return NextResponse.json(
        { error: "Tu suscripción no permite administrar pedidos. Renovala para continuar." },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      include: { items: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);

  } catch (error) {
    console.error("Error al obtener pedidos:", error);

    return NextResponse.json(
      { error: "No se pudieron cargar los pedidos" },
      { status: 500 }
    );
  }
}

// PATCH: confirmar o cancelar un pedido
export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, action } = body;

    if (
      typeof orderId !== "string" ||
      !["confirm", "cancel"].includes(action)
    ) {
      return NextResponse.json(
        { error: "Datos de operación inválidos" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findFirst({
      where: { userId: user.id }
    });

    if (!store) {
      return NextResponse.json(
        { error: "No se encontró tu tienda" },
        { status: 404 }
      );
    }

    // No permitir modificar pedidos sin una suscripción activa
    const subscription = getSubscriptionInfo(store);

    if (!subscription.canManage) {
      return NextResponse.json(
        { error: "Tu suscripción no permite administrar pedidos. Renovala para continuar." },
        { status: 403 }
      );
    }

    const updatedOrder = await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findFirst({
          where: {
            id: orderId,
            storeId: store.id
          },
          include: { items: true }
        });

        if (!order) {
          throw new Error("ORDER_NOT_FOUND");
        }

        if (action === "confirm") {
          if (order.status !== "PENDING") {
            throw new Error("ORDER_NOT_PENDING");
          }

          // Descontar stock al confirmar
          for (const item of order.items) {
            if (!item.productId) {
              throw new Error("PRODUCT_NOT_AVAILABLE");
            }

            const result = await tx.product.updateMany({
              where: {
                id: item.productId,
                storeId: store.id,
                stock: { gte: item.quantity }
              },
              data: {
                stock: { decrement: item.quantity }
              }
            });

            if (result.count !== 1) {
              throw new Error("INSUFFICIENT_STOCK");
            }
          }

          const result = await tx.order.updateMany({
            where: {
              id: order.id,
              storeId: store.id,
              status: "PENDING"
            },
            data: {
              status: "SOLD",
              soldAt: new Date()
            }
          });

          if (result.count !== 1) {
            throw new Error("ORDER_ALREADY_CHANGED");
          }

        } else {
          if (order.status === "CANCELLED") {
            throw new Error("ORDER_ALREADY_CANCELLED");
          }

          const result = await tx.order.updateMany({
            where: {
              id: order.id,
              storeId: store.id,
              status: order.status
            },
            data: {
              status: "CANCELLED",
              cancelledAt: new Date()
            }
          });

          if (result.count !== 1) {
            throw new Error("ORDER_ALREADY_CHANGED");
          }

          // Devolver stock si el pedido ya estaba vendido
          if (order.status === "SOLD") {
            for (const item of order.items) {
              if (item.productId) {
                await tx.product.updateMany({
                  where: {
                    id: item.productId,
                    storeId: store.id
                  },
                  data: {
                    stock: { increment: item.quantity }
                  }
                });
              }
            }
          }
        }

        return await tx.order.findUnique({
          where: { id: order.id },
          include: { items: true }
        });
      },
      {
        isolationLevel: "Serializable"
      }
    );

    return NextResponse.json(updatedOrder);

  } catch (error) {
    console.error("Error al actualizar pedido:", error);

    if (error instanceof Error) {
      const messages: Record<string, { message: string; status: number }> = {
        ORDER_NOT_FOUND: {
          message: "Pedido no encontrado",
          status: 404
        },
        ORDER_NOT_PENDING: {
          message: "Este pedido ya no está pendiente",
          status: 409
        },
        ORDER_ALREADY_CHANGED: {
          message: "El pedido fue modificado. Actualizá la página.",
          status: 409
        },
        ORDER_ALREADY_CANCELLED: {
          message: "Este pedido ya está cancelado",
          status: 409
        },
        PRODUCT_NOT_AVAILABLE: {
          message: "Uno de los productos ya no está disponible",
          status: 409
        },
        INSUFFICIENT_STOCK: {
          message: "No hay stock suficiente para confirmar este pedido",
          status: 409
        }
      };

      const knownError = messages[error.message];

      if (knownError) {
        return NextResponse.json(
          { error: knownError.message },
          { status: knownError.status }
        );
      }

      if ("code" in error && error.code === "P2034") {
        return NextResponse.json(
          {
            error: "Hubo una operación simultánea. Actualizá los pedidos e intentá nuevamente."
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "No se pudo actualizar el pedido" },
      { status: 500 }
    );
  }
}
