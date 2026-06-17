import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/shared/nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      <Nav />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-6xl px-4 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
