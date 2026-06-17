"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TransactionType } from "@prisma/client";
import type { Category } from "@prisma/client";
import type { TransactionWithCategory, PaginatedResult } from "@/types";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorDisplay } from "@/components/shared/error-boundary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { TransactionInput } from "@/lib/validations";

const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<PaginatedResult<TransactionWithCategory> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const page = Number(searchParams.get("page") ?? "1");
  const filters = Object.fromEntries(searchParams.entries());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ ...filters, pageSize: String(PAGE_SIZE) });
      const [txRes, catRes] = await Promise.all([
        fetch(`/api/transactions?${params}`),
        fetch("/api/categories"),
      ]);
      const [txJson, catJson] = await Promise.all([txRes.json(), catRes.json()]);

      if (!txJson.success) throw new Error(txJson.error);
      if (!catJson.success) throw new Error(catJson.error);

      setData(txJson.data);
      setCategories(catJson.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams.toString()]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate(formData: TransactionInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast({ title: "Transacción creada", variant: "success" });
      setDialogOpen(false);
      fetchData();
    } catch {
      toast({ title: "Error al crear transacción", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/transactions?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transacciones</h1>
          <p className="text-muted-foreground">Gestiona tus ingresos y gastos</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva transacción
        </Button>
      </div>

      <TransactionFilters categories={categories} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorDisplay message={error} retry={fetchData} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="Sin transacciones"
          description="Aún no has registrado ninguna transacción. Haz clic en 'Nueva transacción' para comenzar."
          action={{ label: "Nueva transacción", onClick: () => setDialogOpen(true) }}
        />
      ) : (
        <>
          <TransactionList transactions={data.items} categories={categories} />

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= data.totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva transacción</DialogTitle>
          </DialogHeader>
          <TransactionForm
            categories={categories}
            onSubmit={handleCreate}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
