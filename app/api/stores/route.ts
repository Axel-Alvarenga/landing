import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, name, category, template, email, whatsapp, recaptchaToken } = body;

    // 1. Verificar reCAPTCHA con Google
    if (!recaptchaToken) {
      return NextResponse.json({ error: "Falta el token de seguridad." }, { status: 400 });
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
    const googleRes = await fetch(verifyUrl, { method: 'POST' });
    const googleData = await googleRes.json();

    // 2. Evaluar el resultado
    if (!googleData.success || googleData.score < 0.5) {
      console.warn("reCAPTCHA falló:", googleData);
      return NextResponse.json({ error: "Actividad sospechosa detectada. Intentalo de nuevo." }, { status: 403 });
    }

    // 3. Si es humano, procedemos con Prisma
    const existing = await prisma.store.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una tienda con ese nombre." }, { status: 400 });
    }

    const newStore = await prisma.store.create({
      data: { slug, name, category, template, email, whatsapp }
    });

    return NextResponse.json(newStore);

  } catch (error) {
    console.error("ERROR EN API STORES:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}