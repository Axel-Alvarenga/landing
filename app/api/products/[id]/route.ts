import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, price, stock, imageUrl, category } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        // Si imageUrl viene vacío, guardamos null
        imageUrl: imageUrl && imageUrl.trim() !== "" ? imageUrl : null, 
        category: category && category.trim() !== "" ? category.trim() : "General"
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error al actualizar:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}