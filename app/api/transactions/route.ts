import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { transactionSchema } from "@/lib/validations";
import { Prisma, TransactionType } from "@prisma/client";
import type { ApiResponse, PaginatedResult, TransactionWithCategory } from "@/types";

export async function GET(request: Request): Promise<NextResponse<ApiResponse<PaginatedResult<TransactionWithCategory>>>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Number(searchParams.get("pageSize") ?? "10"));
    const month = searchParams.get("month");
    const type = searchParams.get("type") as TransactionType | null;
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const where: Prisma.TransactionWhereInput = {
      userId: session.user.id,
    };

    if (month) {
      const [year, m] = month.split("-").map(Number);
      where.date = {
        gte: new Date(year, m - 1, 1),
        lt: new Date(year, m, 1),
      };
    }

    if (type && Object.values(TransactionType).includes(type)) {
      where.type = type;
    }

    if (categoryId) where.categoryId = categoryId;

    if (search) {
      where.description = { contains: search, mode: "insensitive" };
    }

    const [total, items] = await Promise.all([
      db.transaction.count({ where }),
      db.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: items as TransactionWithCategory[],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Error al obtener transacciones." }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });

    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { amount, type, description, date, categoryId } = parsed.data;

    const category = await db.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ isDefault: true }, { userId: session.user.id }],
      },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: "Categoría no válida." }, { status: 400 });
    }

    const transaction = await db.transaction.create({
      data: {
        amount,
        type,
        description,
        date: new Date(date),
        categoryId,
        userId: session.user.id,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Error al crear transacción." }, { status: 500 });
  }
}
