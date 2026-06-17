import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Ya existe una cuenta con ese email." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.create({ data: { name, email, password: hashedPassword } });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Error interno del servidor." }, { status: 500 });
  }
}
