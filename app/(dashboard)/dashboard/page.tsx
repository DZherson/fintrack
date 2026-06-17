import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { format, startOfMonth, subMonths } from "date-fns";
import { formatDateEs } from "@/lib/locale";
import { TransactionType } from "@prisma/client";
import {
  calculateMonthlyBalance,
  calculateLast6MonthsBalances,
  calculateCategoryBreakdown,
} from "@/lib/calculations";
import { BalanceCards } from "@/components/dashboard/balance-card";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import type { TransactionWithCategory } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const now = new Date();
  const sixMonthsAgo = startOfMonth(subMonths(now, 5));

  const [transactions, recentTransactions] = await Promise.all([
    db.transaction.findMany({
      where: { userId, date: { gte: sixMonthsAgo } },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    db.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  const txWithCategory = transactions as TransactionWithCategory[];
  const currentMonth = format(now, "yyyy-MM");

  const currentBalance = calculateMonthlyBalance(txWithCategory, currentMonth);
  const last6Months = calculateLast6MonthsBalances(txWithCategory);
  const categoryBreakdown = calculateCategoryBreakdown(txWithCategory.filter((t) => {
    const txMonth = format(t.date, "yyyy-MM");
    return txMonth === currentMonth;
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de {formatDateEs(now, "MMMM yyyy")}
        </p>
      </div>

      <BalanceCards
        income={currentBalance.income}
        expenses={currentBalance.expenses}
        balance={currentBalance.balance}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyChart data={last6Months} />
        <CategoryChart data={categoryBreakdown} />
      </div>

      <RecentTransactions transactions={recentTransactions as TransactionWithCategory[]} />
    </div>
  );
}
