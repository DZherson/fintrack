import { z } from "zod";
import { TransactionType } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const transactionSchema = z.object({
  amount: z
    .number({ invalid_type_error: "El monto debe ser un número" })
    .positive("El monto debe ser mayor a 0")
    .multipleOf(0.01, "Máximo 2 decimales"),
  type: z.nativeEnum(TransactionType, { errorMap: () => ({ message: "Tipo inválido" }) }),
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .max(200, "Máximo 200 caracteres"),
  date: z.string().min(1, "La fecha es requerida"),
  categoryId: z.string().min(1, "La categoría es requerida"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(50, "Máximo 50 caracteres"),
  icon: z.string().min(1, "El ícono es requerido"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color hexadecimal inválido"),
});

export const savingGoalSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  targetAmount: z
    .number({ invalid_type_error: "El monto objetivo debe ser un número" })
    .positive("El monto debe ser mayor a 0"),
  deadline: z.string().min(1, "La fecha límite es requerida"),
});

export const contributionSchema = z.object({
  amount: z
    .number({ invalid_type_error: "El monto debe ser un número" })
    .positive("El monto debe ser mayor a 0"),
  note: z.string().max(200, "Máximo 200 caracteres").optional(),
  date: z.string().min(1, "La fecha es requerida"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type SavingGoalInput = z.infer<typeof savingGoalSchema>;
export type ContributionInput = z.infer<typeof contributionSchema>;
