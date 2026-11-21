
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth";
import { addOneMonth } from "@/lib/subscription";

export async function GET(req: Request) {
  const admin = await verifyAdmin(req);

  if (!admin) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const stores = await prisma.store.findMany({
      include: { products: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(stores);
  } catch {
    return NextResponse.json(
      { error: "Error al cargar tiendas" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const admin = await verifyAdmin(req);

  if (!admin) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { storeId, action } = body;

    if (
      typeof storeId !== "string" ||
      !["activate", "extend_trial"].includes(action)
    ) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Tienda no encontrada" },
        { status: 404 }
      );
    }

    const now = new Date();

    if (action === "activate") {
      const baseDate =
        store.subscriptionEndsAt &&
        store.subscriptionEndsAt > now
          ? store.subscriptionEndsAt
          : now;

      const subscriptionEndsAt = addOneMonth(baseDate);

      const updatedStore = await prisma.store.update({
        where: { id: storeId },
        data: {
          planActivatedAt: now,
          subscriptionEndsAt,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Pro activado correctamente",
        store: updatedStore,
      });
    }

    if (store.subscriptionEndsAt !== null) {
      return NextResponse.json(
        {
          error:
            "Esta tienda ya tiene o tuvo una suscripción Pro. No se puede extender su prueba.",
        },
        { status: 400 }
      );
    }

    const currentTrialEnd =
      store.trialEndsAt ??
      new Date(
        store.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000
      );

    const baseDate =
      currentTrialEnd > now ? currentTrialEnd : now;

    const trialEndsAt = new Date(baseDate);
    trialEndsAt.setDate(trialEndsAt.getDate() + 3);

    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: { trialEndsAt },
    });

    return NextResponse.json({
      success: true,
      message: "Prueba extendida correctamente",
      store: updatedStore,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar la suscripción" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const admin = await verifyAdmin(req);

  if (!admin) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID" },
        { status: 400 }
      );
    }

    await prisma.store.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar la tienda" },
      { status: 500 }
    );
  }
}
