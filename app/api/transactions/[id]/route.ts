import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { transactionSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });

    const existing = await db.transaction.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) return NextResponse.json({ success: false, error: "Transacción no encontrada." }, { status: 404 });

    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { amount, type, description, date, categoryId } = parsed.data;

    const updated = await db.transaction.update({
      where: { id: params.id },
      data: { amount, type, description, date: new Date(date), categoryId },
      include: { category: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: "Error al actualizar transacción." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });

    const existing = await db.transaction.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) return NextResponse.json({ success: false, error: "Transacción no encontrada." }, { status: 404 });

    await db.transaction.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Error al eliminar transacción." }, { status: 500 });
  }
}
