import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { getSubscriptionInfo } from "@/lib/subscription";

// Verificar que el usuario esté autenticado
async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return null;

  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data.user) return null;

  return data.user;
}

// Verificar que la tienda permita administrar productos
async function getManageableProduct(id: string, userId: string) {
  const product = await prisma.product.findFirst({
    where: {
      id,
      store: {
        userId,
      },
    },
    include: {
      // 👇 traemos solo lo necesario de la tienda (no la entidad completa)
      store: {
        select: {
          trialEndsAt: true,
          subscriptionEndsAt: true,
          planActivatedAt: true,
        },
      },
    },
  });

  if (!product) {
    return { product: null, error: "Producto no encontrado o sin permisos" };
  }

  const subscription = getSubscriptionInfo(product.store);

  if (!subscription.canManage) {
    return {
      product: null,
      error:
        "Tu suscripción no permite modificar productos. Renovala para continuar.",
    };
  }

  return { product, error: null };
}

// Validar valores de campos personalizados
function validateCustomFieldValue(
  type: string,
  value: string,
  options: string[]
) {
  switch (type) {
    case "TEXT":
      return true;
    case "NUMBER":
      return value.trim() !== "" && Number.isFinite(Number(value));
    case "SELECT":
      return options.includes(value);
    case "DATE":
      return !Number.isNaN(Date.parse(value));
    case "CHECKBOX":
      return value === "true" || value === "false";
    default:
      return false;
  }
}

// ELIMINAR PRODUCTO
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const result = await getManageableProduct(id, user.id);

    if (!result.product) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes("suscripción") ? 403 : 404 }
      );
    }

    await prisma.product.delete({ where: { id } });

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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const { name, price, stock, imageUrl, category, customFieldValues } = body;

    // Validar datos básicos ANTES de tocar la DB
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

    const product = result.product;

    // Si se enviaron campos personalizados, validarlos
    if (customFieldValues !== undefined) {
      if (!Array.isArray(customFieldValues)) {
        return NextResponse.json(
          { error: "Los campos personalizados no son válidos" },
          { status: 400 }
        );
      }

      const receivedFieldIds = customFieldValues.map(
        (item: any) => item?.fieldId
      );

      if (
        receivedFieldIds.some((fieldId: any) => typeof fieldId !== "string") ||
        new Set(receivedFieldIds).size !== receivedFieldIds.length
      ) {
        return NextResponse.json(
          { error: "Hay campos personalizados duplicados o inválidos" },
          { status: 400 }
        );
      }

      const fields = await prisma.customField.findMany({
        where: { storeId: product.storeId },
      });

      const fieldsMap = new Map(fields.map((field) => [field.id, field]));

      for (const item of customFieldValues) {
        if (
          !item ||
          typeof item.fieldId !== "string" ||
          typeof item.value !== "string"
        ) {
          return NextResponse.json(
            { error: "Valor de campo personalizado inválido" },
            { status: 400 }
          );
        }

        const field = fieldsMap.get(item.fieldId);

        if (!field) {
          return NextResponse.json(
            { error: "Uno de los campos no pertenece a esta tienda" },
            { status: 400 }
          );
        }

        if (item.value.trim() === "" && field.required) {
          return NextResponse.json(
            { error: `El campo "${field.name}" es obligatorio` },
            { status: 400 }
          );
        }

        if (
          item.value.trim() !== "" &&
          !validateCustomFieldValue(field.type, item.value, field.options)
        ) {
          return NextResponse.json(
            { error: `El valor del campo "${field.name}" no es válido` },
            { status: 400 }
          );
        }
      }

      for (const field of fields) {
        if (
          field.required &&
          !customFieldValues.some(
            (item: any) => item.fieldId === field.id && item.value.trim() !== ""
          )
        ) {
          return NextResponse.json(
            { error: `El campo "${field.name}" es obligatorio` },
            { status: 400 }
          );
        }
      }
    }

    // Actualizar producto en UNA sola operación atómica.
    // El `deleteMany` + `create` anidados los resuelve Prisma sin timeout interactivo.
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
            : "General",
        // Solo reemplazamos si vinieron campos
        ...(customFieldValues !== undefined
          ? {
              customFieldValues: {
                deleteMany: {}, // borra todos los valores del producto
                create: customFieldValues
                  .filter((item: any) => item.value.trim() !== "")
                  .map((item: any) => ({
                    fieldId: item.fieldId,
                    value: item.value.trim(),
                  })),
              },
            }
          : {}),
      },
      include: {
        customFieldValues: {
          include: {
            field: true,
          },
        },
      },
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