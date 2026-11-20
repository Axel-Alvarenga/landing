
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { storeSlug, customerName, paymentMethod, items } = body;

    if (
      !storeSlug ||
      !customerName?.trim() ||
      !paymentMethod ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Datos del pedido incompletos" },
        { status: 400 }
      );
    }

    // Buscamos la tienda
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return NextResponse.json(
        { error: "Tienda no encontrada" },
        { status: 404 }
      );
    }

    // Agrupamos productos repetidos
    const quantities = new Map<string, number>();

    for (const item of items) {
      if (
        typeof item.productId !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          { error: "Cantidad o producto inválido" },
          { status: 400 }
        );
      }

      quantities.set(
        item.productId,
        (quantities.get(item.productId) || 0) + item.quantity
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: { in: Array.from(quantities.keys()) },
          storeId: store.id
        }
      });

      if (products.length !== quantities.size) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      let total = 0;
      const orderItems = [];

      for (const product of products) {
        const quantity = quantities.get(product.id)!;

        if (product.stock < quantity) {
          throw new Error("INSUFFICIENT_STOCK");
        }

        const subtotal = product.price * quantity;
        total += subtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity,
          subtotal
        });
      }

      return await tx.order.create({
        data: {
          customerName: customerName.trim(),
          paymentMethod,
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
          { error: "Uno de los productos no existe" },
          { status: 400 }
        );
      }

      if (error.message === "INSUFFICIENT_STOCK") {
        return NextResponse.json(
          { error: "No hay suficiente stock para este pedido" },
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
