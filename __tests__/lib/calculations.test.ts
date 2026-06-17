import { describe, it, expect } from "vitest";
import { TransactionType } from "@prisma/client";
import {
  calculateMonthlyBalance,
  calculateLast6MonthsBalances,
  calculateCategoryBreakdown,
  calculateSavingProgress,
  getDaysRemaining,
} from "@/lib/calculations";
import type { TransactionWithCategory } from "@/types";
import { format, subMonths } from "date-fns";

function makeTx(
  overrides: Partial<TransactionWithCategory> = {},
): TransactionWithCategory {
  return {
    id: "tx-1",
    amount: 100 as unknown as TransactionWithCategory["amount"],
    type: TransactionType.EXPENSE,
    description: "Test",
    date: new Date("2024-03-15"),
    categoryId: "cat-1",
    category: {
      id: "cat-1",
      name: "Alimentación",
      icon: "🍔",
      color: "#f97316",
      isDefault: true,
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("calculateMonthlyBalance", () => {
  it("returns zero balance when no transactions", () => {
    const result = calculateMonthlyBalance([], "2024-03");
    expect(result).toEqual({ month: "2024-03", income: 0, expenses: 0, balance: 0 });
  });

  it("sums income and expenses correctly", () => {
    const transactions: TransactionWithCategory[] = [
      makeTx({ type: TransactionType.INCOME, amount: 5000 as unknown as TransactionWithCategory["amount"] }),
      makeTx({ type: TransactionType.EXPENSE, amount: 1500 as unknown as TransactionWithCategory["amount"] }),
      makeTx({ type: TransactionType.EXPENSE, amount: 800 as unknown as TransactionWithCategory["amount"] }),
    ];

    const result = calculateMonthlyBalance(transactions, "2024-03");
    expect(result.income).toBe(5000);
    expect(result.expenses).toBe(2300);
    expect(result.balance).toBe(2700);
  });

  it("ignores transactions from other months", () => {
    const transactions: TransactionWithCategory[] = [
      makeTx({ date: new Date("2024-02-10"), type: TransactionType.INCOME, amount: 9999 as unknown as TransactionWithCategory["amount"] }),
      makeTx({ date: new Date("2024-03-01"), type: TransactionType.INCOME, amount: 1000 as unknown as TransactionWithCategory["amount"] }),
    ];

    const result = calculateMonthlyBalance(transactions, "2024-03");
    expect(result.income).toBe(1000);
  });

  it("returns negative balance when expenses exceed income", () => {
    const transactions: TransactionWithCategory[] = [
      makeTx({ type: TransactionType.INCOME, amount: 1000 as unknown as TransactionWithCategory["amount"] }),
      makeTx({ type: TransactionType.EXPENSE, amount: 2000 as unknown as TransactionWithCategory["amount"] }),
    ];

    const result = calculateMonthlyBalance(transactions, "2024-03");
    expect(result.balance).toBe(-1000);
  });
});

describe("calculateCategoryBreakdown", () => {
  it("returns empty array when no expense transactions", () => {
    const transactions: TransactionWithCategory[] = [
      makeTx({ type: TransactionType.INCOME, amount: 5000 as unknown as TransactionWithCategory["amount"] }),
    ];

    const result = calculateCategoryBreakdown(transactions);
    expect(result).toHaveLength(0);
  });

  it("groups expenses by category and calculates percentages", () => {
    const catFood = { id: "cat-food", name: "Alimentación", icon: "🍔", color: "#f97316", isDefault: true, userId: null, createdAt: new Date(), updatedAt: new Date() };
    const catTransport = { id: "cat-transport", name: "Transporte", icon: "🚗", color: "#3b82f6", isDefault: true, userId: null, createdAt: new Date(), updatedAt: new Date() };

    const transactions: TransactionWithCategory[] = [
      makeTx({ categoryId: "cat-food", category: catFood, amount: 600 as unknown as TransactionWithCategory["amount"] }),
      makeTx({ categoryId: "cat-food", category: catFood, amount: 400 as unknown as TransactionWithCategory["amount"] }),
      makeTx({ categoryId: "cat-transport", category: catTransport, amount: 500 as unknown as TransactionWithCategory["amount"] }),
    ];

    const result = calculateCategoryBreakdown(transactions);
    expect(result).toHaveLength(2);

    const food = result.find((r) => r.categoryId === "cat-food");
    expect(food?.total).toBe(1000);
    expect(food?.percentage).toBeCloseTo(66.67, 1);

    const transport = result.find((r) => r.categoryId === "cat-transport");
    expect(transport?.percentage).toBeCloseTo(33.33, 1);
  });

  it("sorts categories by total descending", () => {
    const catA = { id: "cat-a", name: "A", icon: "A", color: "#000", isDefault: true, userId: null, createdAt: new Date(), updatedAt: new Date() };
    const catB = { id: "cat-b", name: "B", icon: "B", color: "#000", isDefault: true, userId: null, createdAt: new Date(), updatedAt: new Date() };

    const transactions: TransactionWithCategory[] = [
      makeTx({ categoryId: "cat-a", category: catA, amount: 200 as unknown as TransactionWithCategory["amount"] }),
      makeTx({ categoryId: "cat-b", category: catB, amount: 800 as unknown as TransactionWithCategory["amount"] }),
    ];

    const result = calculateCategoryBreakdown(transactions);
    expect(result[0].categoryId).toBe("cat-b");
    expect(result[1].categoryId).toBe("cat-a");
  });
});

describe("calculateSavingProgress", () => {
  it("returns 0 when no contributions", () => {
    const result = calculateSavingProgress([], 10000);
    expect(result.current).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it("sums contributions correctly", () => {
    const contributions = [{ amount: 3000 }, { amount: 2000 }, { amount: 1000 }];
    const result = calculateSavingProgress(contributions, 10000);
    expect(result.current).toBe(6000);
    expect(result.percentage).toBe(60);
  });

  it("caps percentage at 100 even if overcompleted", () => {
    const contributions = [{ amount: 15000 }];
    const result = calculateSavingProgress(contributions, 10000);
    expect(result.percentage).toBe(100);
  });

  it("handles zero target amount without dividing by zero", () => {
    const result = calculateSavingProgress([{ amount: 1000 }], 0);
    expect(result.percentage).toBe(0);
  });
});

describe("getDaysRemaining", () => {
  it("returns 0 for past dates", () => {
    const pastDate = new Date("2020-01-01");
    expect(getDaysRemaining(pastDate)).toBe(0);
  });

  it("returns positive days for future dates", () => {
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const days = getDaysRemaining(futureDate);
    expect(days).toBeGreaterThan(0);
    expect(days).toBeLessThanOrEqual(11);
  });
});
