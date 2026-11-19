import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeId, name, price, stock, imageUrl, category } = body;

    const product = await prisma.product.create({
      data: { 
        storeId, 
        name, 
        price: parseFloat(price), 
        stock: parseInt(stock),
        // Si imageUrl viene vacío, guardamos null
        imageUrl: imageUrl && imageUrl.trim() !== "" ? imageUrl : null,
        category: category && category.trim() !== "" ? category.trim() : "General" 
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}