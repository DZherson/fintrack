"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { savingGoalSchema, type SavingGoalInput } from "@/lib/validations";
import { format, addMonths } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GoalFormProps {
  onSubmit: (data: SavingGoalInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function GoalForm({ onSubmit, onCancel, isSubmitting = false }: GoalFormProps) {
  const form = useForm<SavingGoalInput>({
    resolver: zodResolver(savingGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: undefined,
      deadline: format(addMonths(new Date(), 6), "yyyy-MM-dd"),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la meta</FormLabel>
              <FormControl>
                <Input placeholder="ej. Vacaciones de verano" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto objetivo (MXN)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha límite</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear meta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
