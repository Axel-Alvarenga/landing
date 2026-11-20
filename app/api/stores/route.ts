
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // 1. Verificar sesión del usuario
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No estás autenticado." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } =
      await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesión inválida." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      slug,
      name,
      category,
      template,
      email,
      whatsapp,
      recaptchaToken
    } = body;

    // 2. Verificar reCAPTCHA
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: "Falta el token de seguridad." },
        { status: 400 }
      );
    }

    const verifyUrl =
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

    const googleRes = await fetch(verifyUrl, { method: "POST" });
    const googleData = await googleRes.json();

    if (!googleData.success || googleData.score < 0.5) {
      return NextResponse.json(
        { error: "Actividad sospechosa detectada." },
        { status: 403 }
      );
    }

    // 3. Comprobar si ya existe la tienda
    const existing = await prisma.store.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una tienda con ese nombre." },
        { status: 400 }
      );
    }

    // 4. Crear tienda vinculada al usuario autenticado
    const newStore = await prisma.store.create({
      data: {
        slug,
        name,
        category,
        template,
        email,
        whatsapp,
        userId: user.id
      }
    });

    return NextResponse.json(newStore);

  } catch (error) {
    console.error("ERROR EN API STORES:", error);

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
