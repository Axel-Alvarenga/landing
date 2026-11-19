import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data.users);
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// NUEVA FUNCIÓN: Actualizar estado del usuario (Extender prueba o Activar)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, action } = body; // action: "extend_trial" | "activate"

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Calculamos la nueva fecha según la acción
    const newCreatedAt = new Date();
    if (action === "extend_trial") {
      newCreatedAt.setDate(newCreatedAt.getDate() - 3); // Le damos 3 días más (3 + 7 = 10 días total)
    }

    // En Supabase, para "resetear" la prueba, podemos actualizar el created_at
    // O usar user_metadata para marcar que está activo
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { 
        plan: action === "activate" ? "pro" : "trial",
        trial_extended: action === "extend_trial" ? true : false
      }
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, user: data.user });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}