import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TransactionType } from "@prisma/client";
import type { TransactionWithCategory } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/calculations";
import { ArrowRight } from "lucide-react";

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transacciones recientes</CardTitle>
          <CardDescription>Últimas 5 operaciones registradas</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/transactions" className="gap-1">
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay transacciones aún.
          </p>
        ) : (
          <ul className="space-y-3">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-base">
                    {t.category.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-none">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(t.date, "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.type === TransactionType.INCOME ? "income" : "expense"}>
                    {t.type === TransactionType.INCOME ? "Ingreso" : "Gasto"}
                  </Badge>
                  <span
                    className={
                      t.type === TransactionType.INCOME
                        ? "font-semibold text-green-600"
                        : "font-semibold text-red-600"
                    }
                  >
                    {t.type === TransactionType.INCOME ? "+" : "-"}
                    {formatCurrency(Number(t.amount))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
