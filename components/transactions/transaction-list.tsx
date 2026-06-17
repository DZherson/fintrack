"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TransactionType } from "@prisma/client";
import type { Category } from "@prisma/client";
import type { TransactionWithCategory } from "@/types";
import { formatCurrency } from "@/lib/calculations";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";
import { Pencil, Trash2 } from "lucide-react";
import type { TransactionInput } from "@/lib/validations";

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  categories: Category[];
}

export function TransactionList({ transactions, categories }: TransactionListProps) {
  const router = useRouter();
  const [editingTx, setEditingTx] = useState<TransactionWithCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleEdit(data: TransactionInput) {
    if (!editingTx) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/transactions/${editingTx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast({ title: "Transacción actualizada", variant: "success" });
      setEditingTx(null);
      router.refresh();
    } catch {
      toast({ title: "Error al actualizar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/transactions/${deletingId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast({ title: "Transacción eliminada" });
      setDeletingId(null);
      router.refresh();
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.description}</TableCell>
              <TableCell>
                <span className="flex items-center gap-1.5 text-sm">
                  <span>{t.category.icon}</span>
                  {t.category.name}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(t.date, "d MMM yyyy", { locale: es })}
              </TableCell>
              <TableCell>
                <Badge variant={t.type === TransactionType.INCOME ? "income" : "expense"}>
                  {t.type === TransactionType.INCOME ? "Ingreso" : "Gasto"}
                </Badge>
              </TableCell>
              <TableCell
                className={`text-right font-semibold ${t.type === TransactionType.INCOME ? "text-green-600" : "text-red-600"}`}
              >
                {t.type === TransactionType.INCOME ? "+" : "-"}
                {formatCurrency(Number(t.amount))}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditingTx(t)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeletingId(t.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit dialog */}
      <Dialog open={!!editingTx} onOpenChange={(o) => !o && setEditingTx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar transacción</DialogTitle>
          </DialogHeader>
          {editingTx && (
            <TransactionForm
              categories={categories}
              defaultValues={editingTx}
              onSubmit={handleEdit}
              onCancel={() => setEditingTx(null)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar transacción</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
