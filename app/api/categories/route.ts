import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });

    const categories = await db.category.findMany({
      where: {
        OR: [{ isDefault: true }, { userId: session.user.id }],
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ success: true, data: categories });
  } catch {
    return NextResponse.json({ success: false, error: "Error al obtener categorías." }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });

    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const category = await db.category.create({
      data: { ...parsed.data, userId: session.user.id },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Error al crear categoría." }, { status: 500 });
  }
}
