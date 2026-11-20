
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // 1. Verificar sesión
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Sesión inválida" },
        { status: 401 }
      );
    }

    // 2. Obtener datos
    const body = await req.json();
    const { storeId, name, price, stock, imageUrl, category } = body;

    if (
      !storeId ||
      typeof name !== "string" ||
      !name.trim() ||
      !Number.isFinite(Number(price)) ||
      !Number.isInteger(Number(stock)) ||
      Number(price) < 0 ||
      Number(stock) < 0
    ) {
      return NextResponse.json(
        { error: "Datos del producto inválidos" },
        { status: 400 }
      );
    }

    // 3. Verificar que la tienda pertenezca al usuario
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: data.user.id
      }
    });

    if (!store) {
      return NextResponse.json(
        { error: "No tenés permiso para esta tienda" },
        { status: 403 }
      );
    }

    // 4. Crear producto
    const product = await prisma.product.create({
      data: {
        storeId,
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        imageUrl:
          typeof imageUrl === "string" && imageUrl.trim()
            ? imageUrl.trim()
            : null,
        category:
          typeof category === "string" && category.trim()
            ? category.trim()
            : "General"
      }
    });

    return NextResponse.json(product);

  } catch (error) {
    console.error("Error al crear producto:", error);

    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    );
  }
}
