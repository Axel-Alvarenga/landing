import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { getSubscriptionInfo } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data.user) return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });

    const body = await req.json();
    const { storeId, products } = body;

    if (!storeId || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Datos inválidos o lista vacía" }, { status: 400 });
    }

    // Verificar tienda y suscripción
    const store = await prisma.store.findFirst({
      where: { id: storeId, userId: data.user.id },
      include: { customFields: true } // 👈 Traemos los campos de la tienda
    });

    if (!store) return NextResponse.json({ error: "No tenés permiso" }, { status: 403 });

    const subscription = getSubscriptionInfo(store);
    if (!subscription.canManage) {
      return NextResponse.json({ error: "Tu suscripción no permite modificar productos" }, { status: 403 });
    }

    // Insertar productos y sus valores en una transacción (para que sea rápido)
    const result = await prisma.$transaction(async (tx) => {
      let count = 0;
      
      for (const p of products) {
        // 1. Crear el producto base
        const newProduct = await tx.product.create({
          data: {
            storeId: store.id,
            name: p.name.trim(),
            price: Number(p.price),
            stock: Number(p.stock) || 0,
            category: p.category?.trim() || "General",
          }
        });

        // 2. Procesar los campos personalizados
        if (p.customFields && typeof p.customFields === "object") {
          const valuesToCreate = [];
          
          for (const [key, value] of Object.entries(p.customFields)) {
            // Buscamos si existe un campo en la tienda que coincida con esta columna (ignorando mayúsculas)
            const field = store.customFields.find(
              (f) => f.name.toLowerCase() === key.toLowerCase() && value !== ""
            );

            if (field) {
              valuesToCreate.push({
                productId: newProduct.id,
                fieldId: field.id,
                value: String(value).trim()
              });
            }
          }

          // Guardar los valores del producto
          if (valuesToCreate.length > 0) {
            await tx.productCustomFieldValue.createMany({
              data: valuesToCreate
            });
          }
        }
        count++;
      }
      return { count };
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Error al importar CSV:", error);
    return NextResponse.json({ error: "Error interno al importar" }, { status: 500 });
  }
}