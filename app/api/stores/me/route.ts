
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { getSubscriptionInfo } from "@/lib/subscription";

export async function GET(req: Request) {
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

    // 2. Obtener tienda, productos y campos personalizados
    const store = await prisma.store.findFirst({
      where: {
        userId: data.user.id
      },
      include: {
        products: {
          include: {
            customFieldValues: {
              select: {
                fieldId: true,
                value: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        },

        customFields: {
          orderBy: {
            sortOrder: "asc"
          }
        }
      }
    });

    if (!store) {
      return NextResponse.json(
        { error: "No se encontró una tienda para este usuario" },
        { status: 404 }
      );
    }

    // 3. Calcular estado de suscripción
    const subscription = getSubscriptionInfo(store);

    // 4. Devolver información de la tienda
    return NextResponse.json({
      ...store,
      subscription
    });

  } catch (error) {
    console.error("Error buscando tienda del usuario:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
