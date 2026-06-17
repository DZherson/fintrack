"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, calculateSavingProgress, getDaysRemaining } from "@/lib/calculations";
import { toast } from "@/hooks/use-toast";
import type { SavingGoalWithContributions } from "@/types";
import { Target, Calendar, Trash2, PlusCircle } from "lucide-react";

interface GoalCardProps {
  goal: SavingGoalWithContributions;
}

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter();
  const [addingContrib, setAddingContrib] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { current, percentage } = calculateSavingProgress(
    goal.contributions,
    Number(goal.targetAmount),
  );
  const daysRemaining = getDaysRemaining(goal.deadline);
  const isCompleted = percentage >= 100;

  async function handleAddContribution() {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({ title: "Ingresa un monto válido", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/savings/${goal.id}/contributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount, note: note || undefined, date: new Date().toISOString() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast({ title: "Abono registrado", variant: "success" });
      setAddingContrib(false);
      setAmount("");
      setNote("");
      router.refresh();
    } catch {
      toast({ title: "Error al registrar abono", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/savings/${goal.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast({ title: "Meta eliminada" });
      setDeletingGoal(false);
      router.refresh();
    } catch {
      toast({ title: "Error al eliminar meta", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{goal.name}</CardTitle>
            </div>
            {isCompleted && (
              <Badge variant="income" className="shrink-0">
                ¡Completada! 🎉
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{percentage.toFixed(0)}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(current)}</span>
              <span>{formatCurrency(Number(goal.targetAmount))}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Fecha límite: {format(goal.deadline, "d 'de' MMMM yyyy", { locale: es })}
              {!isCompleted && (
                <span className={daysRemaining < 30 ? "ml-1 font-medium text-orange-600" : "ml-1"}>
                  ({daysRemaining} días restantes)
                </span>
              )}
            </span>
          </div>

          <div className="text-xs text-muted-foreground">
            {goal.contributions.length} abono{goal.contributions.length !== 1 ? "s" : ""} registrados
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          {!isCompleted && (
            <Button size="sm" className="gap-1.5" onClick={() => setAddingContrib(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              Registrar abono
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto text-destructive hover:text-destructive"
            onClick={() => setDeletingGoal(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>

      {/* Add contribution dialog */}
      <Dialog open={addingContrib} onOpenChange={(o) => !o && setAddingContrib(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar abono — {goal.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Monto (MXN)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Nota (opcional)</Label>
              <Input
                placeholder="ej. Bono de trabajo"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingContrib(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleAddContribution} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar abono"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deletingGoal} onOpenChange={(o) => !o && setDeletingGoal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar meta</DialogTitle>
            <DialogDescription>
              ¿Eliminar la meta &quot;{goal.name}&quot;? Se perderán todos los abonos registrados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingGoal(false)} disabled={isSubmitting}>
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
