"use client";

import { useState, useEffect, useCallback } from "react";
import type { SavingGoalWithContributions } from "@/types";
import { GoalCard } from "@/components/savings/goal-card";
import { GoalForm } from "@/components/savings/goal-form";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorDisplay } from "@/components/shared/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { SavingGoalInput } from "@/lib/validations";

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingGoalWithContributions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/savings");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setGoals(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar metas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  async function handleCreate(data: SavingGoalInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast({ title: "Meta creada", variant: "success" });
      setDialogOpen(false);
      fetchGoals();
    } catch {
      toast({ title: "Error al crear meta", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Metas de ahorro</h1>
          <p className="text-muted-foreground">Define objetivos y sigue tu progreso</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva meta
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorDisplay message={error} retry={fetchGoals} />
      ) : goals.length === 0 ? (
        <EmptyState
          title="Sin metas de ahorro"
          description="Crea tu primera meta de ahorro para comenzar a ahorrar hacia algo importante."
          action={{ label: "Crear primera meta", onClick: () => setDialogOpen(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva meta de ahorro</DialogTitle>
          </DialogHeader>
          <GoalForm
            onSubmit={handleCreate}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
