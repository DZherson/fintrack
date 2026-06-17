import type { Category, SavingGoal, SavingContribution, Transaction, TransactionType } from "@prisma/client";

export type { TransactionType };

export type TransactionWithCategory = Transaction & {
  category: Category;
};

export type SavingGoalWithContributions = SavingGoal & {
  contributions: SavingContribution[];
};

export type MonthlyBalance = {
  month: string; // "YYYY-MM"
  income: number;
  expenses: number;
  balance: number;
};

export type CategoryBreakdown = {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  total: number;
  percentage: number;
};

export type ApiResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type TransactionFilters = {
  month?: string; // "YYYY-MM"
  type?: TransactionType;
  categoryId?: string;
  search?: string;
  page?: number;
};

export type DashboardData = {
  currentMonthBalance: MonthlyBalance;
  last6Months: MonthlyBalance[];
  categoryBreakdown: CategoryBreakdown[];
  recentTransactions: TransactionWithCategory[];
};
