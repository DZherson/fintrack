import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savingGoalSchema } from "@/lib/validations";
import type { ApiResponse, SavingGoalWithContributions } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<SavingGoalWithContributions[]>>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });

    const goals = await db.savingGoal.findMany({
      where: { userId: session.user.id },
      include: { contributions: { orderBy: { date: "desc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: goals as SavingGoalWithContributions[] });
  } catch {
    return NextResponse.json({ success: false, error: "Error al obtener metas." }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });

    const body = await request.json();
    const parsed = savingGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, targetAmount, deadline } = parsed.data;

    const goal = await db.savingGoal.create({
      data: { name, targetAmount, deadline: new Date(deadline), userId: session.user.id },
      include: { contributions: true },
    });

    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Error al crear meta." }, { status: 500 });
  }
}
