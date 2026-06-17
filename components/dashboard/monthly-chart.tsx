"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { MonthlyBalance } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface MonthlyChartProps {
  data: MonthlyBalance[];
}

function formatMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  return format(new Date(year, m - 1, 1), "MMM", { locale: es });
}

function formatMXN(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const chartData = data.map((d) => ({
    name: formatMonth(d.month),
    Ingresos: d.income,
    Gastos: d.expenses,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos vs Gastos</CardTitle>
        <CardDescription>Comparación de los últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v: number) => formatMXN(v)} tick={{ fontSize: 11 }} width={80} />
            <Tooltip formatter={(value: number) => formatMXN(value)} />
            <Legend />
            <Bar dataKey="Ingresos" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Gastos" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
