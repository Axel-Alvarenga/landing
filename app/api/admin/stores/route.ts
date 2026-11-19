import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: { products: true }, // Traemos los productos para saber cuántos tiene
      orderBy: { createdAt: "desc" } // Las más nuevas primero
    });
    return NextResponse.json(stores);
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar tiendas" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Falta el ID" }, { status: 400 });

    // Al borrar la tienda, Prisma borrará sus productos automáticamente (onDelete: Cascade)
    await prisma.store.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar la tienda" }, { status: 500 });
  }
}