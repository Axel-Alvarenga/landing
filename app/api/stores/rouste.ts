import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, name, category, template, email, whatsapp } = body;

    const existing = await prisma.store.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una tienda con ese nombre. Elegí otro." }, { status: 400 });
    }

    const newStore = await prisma.store.create({
      data: { slug, name, category, template, email, whatsapp }
    });

    return NextResponse.json(newStore);
  } catch (error) {
    return NextResponse.json({ error: "Error al crear la tienda" }, { status: 500 });
  }
}