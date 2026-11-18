import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const store = await prisma.store.findUnique({
    where: { slug },
    include: { products: true }
  });

  if (!store) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  
  return NextResponse.json(store);
}