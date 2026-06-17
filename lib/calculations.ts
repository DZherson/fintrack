import { TransactionType, type Prisma } from "@prisma/client";
import { subMonths, format, startOfMonth, endOfMonth } from "date-fns";
import type { TransactionWithCategory, MonthlyBalance, CategoryBreakdown } from "@/types";

export function calculateMonthlyBalance(
  transactions: TransactionWithCategory[],
  month: string, // "YYYY-MM"
): MonthlyBalance {
  const filtered = transactions.filter((t) => format(t.date, "yyyy-MM") === month);

  const income = filtered
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = filtered
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    month,
    income,
    expenses,
    balance: income - expenses,
  };
}

export function calculateLast6MonthsBalances(
  transactions: TransactionWithCategory[],
): MonthlyBalance[] {
  const now = new Date();
  const months: MonthlyBalance[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i);
    const monthKey = format(date, "yyyy-MM");
    months.push(calculateMonthlyBalance(transactions, monthKey));
  }

  return months;
}

export function calculateCategoryBreakdown(
  transactions: TransactionWithCategory[],
  type: TransactionType = TransactionType.EXPENSE,
): CategoryBreakdown[] {
  const expenseTransactions = transactions.filter((t) => t.type === type);

  const totalAmount = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  if (totalAmount === 0) return [];

  const byCategory = new Map<
    string,
    { name: string; color: string; icon: string; total: number }
  >();

  for (const t of expenseTransactions) {
    const existing = byCategory.get(t.categoryId);
    if (existing) {
      existing.total += Number(t.amount);
    } else {
      byCategory.set(t.categoryId, {
        name: t.category.name,
        color: t.category.color,
        icon: t.category.icon,
        total: Number(t.amount),
      });
    }
  }

  return Array.from(byCategory.entries())
    .map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      color: data.color,
      icon: data.icon,
      total: data.total,
      percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function getDateRangeForMonth(month: string): { start: Date; end: Date } {
  const [year, monthNum] = month.split("-").map(Number);
  const date = new Date(year, monthNum - 1, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function calculateSavingProgress(
  contributions: { amount: number | string | Prisma.Decimal }[],
  targetAmount: number,
): { current: number; percentage: number } {
  const current = contributions.reduce((sum, c) => sum + Number(c.amount), 0);
  const percentage = targetAmount > 0 ? Math.min((current / targetAmount) * 100, 100) : 0;
  return { current, percentage };
}

export { formatCurrency } from "@/lib/locale";

export function getDaysRemaining(deadline: Date): number {
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
