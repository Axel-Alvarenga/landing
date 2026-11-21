
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/lib/admin-auth";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function GET(req: Request) {
  const admin = await verifyAdmin(req);

  if (!admin) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } =
      await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data.users);
  } catch {
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

// Las suscripciones ahora se administran por tienda.
export async function PUT(req: Request) {
  const admin = await verifyAdmin(req);

  if (!admin) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      error:
        "Las suscripciones ahora se administran individualmente desde cada tienda.",
    },
    { status: 400 }
  );
}
