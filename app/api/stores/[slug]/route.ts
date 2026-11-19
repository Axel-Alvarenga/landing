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

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { template, logoUrl } = body; // <-- Asegurate que esté esto

    const updatedStore = await prisma.store.update({
      where: { slug },
      data: { 
        template: template || undefined, 
        logoUrl: logoUrl || undefined // <-- Y esto
      }
    });

    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error("Error en PUT stores:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}