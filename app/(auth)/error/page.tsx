import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold">Error de autenticación</h1>
      <p className="max-w-sm text-muted-foreground">
        Ocurrió un problema al iniciar sesión. Puede que las credenciales sean incorrectas o que la
        cuenta no exista.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/register">Crear cuenta</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Intentar de nuevo</Link>
        </Button>
      </div>
    </div>
  );
}
