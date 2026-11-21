
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { getSubscriptionInfo } from "@/lib/subscription";

// Verificar que el usuario esté autenticado
async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

// Verificar que la tienda permita administrar productos
async function getManageableProduct(id: string, userId: string) {
  const product = await prisma.product.findFirst({
    where: {
      id,
      store: {
        userId
      }
    },
    include: {
      store: true
    }
  });

  if (!product) {
    return {
      product: null,
      error: "Producto no encontrado o sin permisos"
    };
  }

  const subscription = getSubscriptionInfo(product.store);

  if (!subscription.canManage) {
    return {
      product: null,
      error: "Tu suscripción no permite modificar productos. Renovala para continuar."
    };
  }

  return {
    product,
    error: null
  };
}

// ELIMINAR PRODUCTO
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const result = await getManageableProduct(id, user.id);

    if (!result.product) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes("suscripción") ? 403 : 404 }
      );
    }

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error al eliminar producto:", error);

    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}

// EDITAR PRODUCTO
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const { name, price, stock, imageUrl, category } = body;

    if (
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

    const result = await getManageableProduct(id, user.id);

    if (!result.product) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes("suscripción") ? 403 : 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
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

    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error("Error al actualizar producto:", error);

    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}
