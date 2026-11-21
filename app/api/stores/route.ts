
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // 1. Verificar que el usuario esté autenticado.
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No estás autenticado." },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Tu sesión no es válida. Iniciá sesión nuevamente." },
        { status: 401 }
      );
    }

    // 2. Comprobar si el usuario ya tiene una tienda.
    const existingUserStore = await prisma.store.findFirst({
      where: { userId: user.id },
    });

    if (existingUserStore) {
      return NextResponse.json(
        {
          error: "Ya tenés una tienda registrada.",
          existingStore: {
            id: existingUserStore.id,
            slug: existingUserStore.slug,
            name: existingUserStore.name,
          },
        },
        { status: 409 }
      );
    }

    // 3. Obtener y validar los datos.
    const body = await req.json();

    const {
      slug,
      name,
      category,
      template,
      email,
      whatsapp,
      recaptchaToken,
    } = body;

    if (
      !slug ||
      !name?.trim() ||
      !category ||
      !template ||
      !email?.trim() ||
      !whatsapp?.trim()
    ) {
      return NextResponse.json(
        { error: "Completá todos los campos obligatorios." },
        { status: 400 }
      );
    }

    // 4. Verificar reCAPTCHA.
    if (!recaptchaToken || !process.env.RECAPTCHA_SECRET_KEY) {
      return NextResponse.json(
        { error: "No se pudo verificar la seguridad." },
        { status: 400 }
      );
    }

    const googleRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        }),
      }
    );

    const googleData = await googleRes.json();

    if (
      !googleData.success ||
      googleData.score < 0.5 ||
      googleData.action !== "registro_tienda"
    ) {
      return NextResponse.json(
        {
          error: "No se pudo verificar la actividad. Intentá nuevamente.",
        },
        { status: 403 }
      );
    }

    // 5. Comprobar si el nombre de la tienda ya existe.
    const existingSlug = await prisma.store.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Ya existe una tienda con ese nombre. Elegí otro." },
        { status: 409 }
      );
    }

    // 6. Crear la tienda con 7 días de prueba gratuita.
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const newStore = await prisma.store.create({
      data: {
        slug,
        name: name.trim(),
        category,
        template,
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        userId: user.id,

        // Suscripción inicial.
        trialEndsAt,
        subscriptionEndsAt: null,
        planActivatedAt: null,
      },
    });

    return NextResponse.json(newStore, { status: 201 });

  } catch (error) {
    console.error("ERROR EN API STORES:", error);

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
