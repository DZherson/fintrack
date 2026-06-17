import { format } from "date-fns";
import { es } from "date-fns/locale";

export const APP_LOCALE = "es-MX";
export const APP_CURRENCY = "MXN";
export const DATE_FNS_LOCALE = es;

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(APP_LOCALE, {
    style: "currency",
    currency: APP_CURRENCY,
  }).format(amount);
}

export function formatDateEs(date: Date, pattern: string): string {
  return format(date, pattern, { locale: es });
}
