import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  income: number;
  expenses: number;
  balance: number;
}

function StatCard({
  title,
  amount,
  icon: Icon,
  colorClass,
}: {
  title: string;
  amount: number;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("rounded-full p-2", colorClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
      </CardContent>
    </Card>
  );
}

export function BalanceCards({ income, expenses, balance }: BalanceCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        title="Ingresos del mes"
        amount={income}
        icon={TrendingUp}
        colorClass="bg-green-100 text-green-700"
      />
      <StatCard
        title="Gastos del mes"
        amount={expenses}
        icon={TrendingDown}
        colorClass="bg-red-100 text-red-700"
      />
      <StatCard
        title="Balance"
        amount={balance}
        icon={Wallet}
        colorClass={balance >= 0 ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}
      />
    </div>
  );
}
