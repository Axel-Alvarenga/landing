import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { storeId, name, price, stock } = body;

  const product = await prisma.product.create({
    data: { storeId, name, price: parseFloat(price), stock: parseInt(stock) }
  });

  return NextResponse.json(product);
}