import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types";

type Params = { params: { id: string } };

export async function DELETE(_request: Request, { params }: Params): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });

    const existing = await db.savingGoal.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) return NextResponse.json({ success: false, error: "Meta no encontrada." }, { status: 404 });

    await db.savingGoal.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Error al eliminar meta." }, { status: 500 });
  }
}
