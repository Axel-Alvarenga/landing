import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  console.log("🟢 1. La API /api/stores recibió una petición");

  try {
    const body = await req.json();
    console.log("🟢 2. Body recibido:", body);

    const { slug, name, category, template, email, whatsapp } = body;

    console.log("🟡 3. Buscando si la tienda ya existe...");
    const existing = await prisma.store.findUnique({ where: { slug } });
    
    if (existing) {
      console.log("🔴 4. La tienda ya existe.");
      return NextResponse.json({ error: "Ya existe una tienda con ese nombre." }, { status: 400 });
    }

    console.log("🟡 5. Creando la tienda en la base de datos...");
    const newStore = await prisma.store.create({
      data: { slug, name, category, template, email, whatsapp }
    });

    console.log("🟢 6. Tienda creada con éxito:", newStore);
    return NextResponse.json(newStore);

  } catch (error: any) {
    // Si Prisma falla, esto atrapará el error y nos lo mostrará en la terminal
    console.error("🔴 ERROR CRÍTICO EN LA API:", error);
    
    return new NextResponse(
      `ERROR DEL SERVIDOR:\n${error.message || "Error desconocido"}\n\nStack Trace:\n${error.stack || "No hay stack"}`,
      { status: 500, headers: { "Content-Type": "text/plain" } }
    );
  }
}