import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contributionSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });

    const goal = await db.savingGoal.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!goal) return NextResponse.json({ success: false, error: "Meta no encontrada." }, { status: 404 });

    const body = await request.json();
    const parsed = contributionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { amount, note, date } = parsed.data;

    const contribution = await db.savingContribution.create({
      data: {
        amount,
        note,
        date: new Date(date),
        savingGoalId: params.id,
      },
    });

    return NextResponse.json({ success: true, data: contribution }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Error al registrar abono." }, { status: 500 });
  }
}
