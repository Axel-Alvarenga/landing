import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { getSubscriptionInfo } from "@/lib/subscription";

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
      return value.trim() !== "" && !Number.isNaN(Date.parse(value));
    case "CHECKBOX":
      return value === "true" || value === "false";
    default:
      return false;
  }
}

export async function POST(req: Request) {
  try {
    // 1. Verificar sesión
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    // 2. Obtener datos
    const body = await req.json();

    const { storeId, name, price, stock, imageUrl, category, customFieldValues } =
      body;

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

    // 3. Verificar tienda + traer custom fields en una sola query
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: data.user.id,
      },
      include: {
        customFields: true, // 👈 una sola query en vez de dos
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "No tenés permiso para esta tienda" },
        { status: 403 }
      );
    }

    // 4. Verificar suscripción
    const subscription = getSubscriptionInfo(store);

    if (!subscription.canManage) {
      return NextResponse.json(
        {
          error:
            "Tu suscripción no permite modificar productos. Renovala para continuar.",
        },
        { status: 403 }
      );
    }

    // 5. Validar estructura de campos personalizados
    const values = customFieldValues ?? [];

    if (!Array.isArray(values)) {
      return NextResponse.json(
        { error: "Los campos personalizados no son válidos" },
        { status: 400 }
      );
    }

    const receivedFieldIds = values.map((item: any) => item?.fieldId);

    if (
      receivedFieldIds.some((fieldId: any) => typeof fieldId !== "string") ||
      new Set(receivedFieldIds).size !== receivedFieldIds.length
    ) {
      return NextResponse.json(
        { error: "Hay campos personalizados duplicados o inválidos" },
        { status: 400 }
      );
    }

    // 6. Los fields ya vienen incluidos en `store`
    const fields = store.customFields;
    const fieldsMap = new Map(fields.map((field) => [field.id, field]));

    // 7. Validar cada valor recibido
    for (const item of values) {
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

    // 8. Comprobar que estén presentes los campos obligatorios
    for (const field of fields) {
      if (
        field.required &&
        !values.some(
          (item: any) => item.fieldId === field.id && item.value.trim() !== ""
        )
      ) {
        return NextResponse.json(
          { error: `El campo "${field.name}" es obligatorio` },
          { status: 400 }
        );
      }
    }

    // 9. Crear producto con `create` anidado (atómico, SIN timeout interactivo)
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
            : "General",
        customFieldValues: {
          create: values
            .filter((item: any) => item.value.trim() !== "")
            .map((item: any) => ({
              fieldId: item.fieldId,
              value: item.value.trim(),
            })),
        },
      },
      include: {
        customFieldValues: {
          include: {
            field: true,
          },
        },
      },
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