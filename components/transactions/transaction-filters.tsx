"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TransactionType } from "@prisma/client";
import type { Category } from "@prisma/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TransactionFiltersProps {
  categories: Category[];
}

export function TransactionFilters({ categories }: TransactionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const month = searchParams.get("month") ?? "";
  const type = searchParams.get("type") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const search = searchParams.get("search") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/transactions?${params.toString()}`);
  }

  const hasFilters = month || type || categoryId || search;

  function clearFilters() {
    router.push("/transactions");
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Mes</label>
        <Input
          type="month"
          value={month}
          onChange={(e) => updateParam("month", e.target.value)}
          className="h-9 w-40"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Tipo</label>
        <Select value={type || "all"} onValueChange={(v) => updateParam("type", v)}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value={TransactionType.INCOME}>Ingresos</SelectItem>
            <SelectItem value={TransactionType.EXPENSE}>Gastos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Categoría</label>
        <Select value={categoryId || "all"} onValueChange={(v) => updateParam("categoryId", v)}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Buscar</label>
        <Input
          placeholder="Descripción..."
          value={search}
          onChange={(e) => updateParam("search", e.target.value)}
          className="h-9 w-48"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 self-end">
          <X className="h-3 w-3" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
