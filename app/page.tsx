import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Target, Shield } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FinTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Comenzar gratis</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Toma el control de <br />
            <span className="text-primary">tus finanzas</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Registra, categoriza y visualiza tus gastos e ingresos en un dashboard limpio e
            intuitivo. Sin hojas de cálculo, sin complicaciones.
          </p>
        </div>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Comenzar gratis</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Ver demo</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold">
            Todo lo que necesitas en un solo lugar
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Dashboard visual",
                desc: "Gráficos de barras y dona para entender en segundos hacia dónde va tu dinero.",
              },
              {
                icon: Target,
                title: "Metas de ahorro",
                desc: "Define objetivos, registra abonos y sigue tu progreso con barras visuales.",
              },
              {
                icon: Shield,
                title: "Tus datos, seguros",
                desc: "Autenticación con Google o contraseña. Cada dato es privado a tu cuenta.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-md bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 FinTrack · Hecho con ❤️ por David Matu
      </footer>
    </main>
  );
}
