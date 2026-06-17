"use client";

import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  message?: string;
  retry?: () => void;
}

export function ErrorDisplay({ message = "Ocurrió un error inesperado.", retry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <div>
        <p className="font-semibold">Algo salió mal</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {retry && (
        <Button onClick={retry} variant="outline" size="sm">
          Reintentar
        </Button>
      )}
    </div>
  );
}
