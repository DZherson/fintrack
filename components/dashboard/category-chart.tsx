"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { CategoryBreakdown } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";

interface CategoryChartProps {
  data: CategoryBreakdown[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gastos por categoría</CardTitle>
          <CardDescription>Distribución del mes actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No hay gastos registrados este mes.
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name: `${d.icon} ${d.categoryName}`,
    value: d.total,
    color: d.color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por categoría</CardTitle>
        <CardDescription>Distribución del mes actual</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
