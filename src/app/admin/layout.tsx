import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-[220px_1fr] gap-6">
      <aside className="md:sticky md:top-4 self-start">
        <div className="border border-black/10 rounded-lg bg-white p-3">
          <p className="text-xs uppercase text-black/50 mb-2 font-bold">
            Panel admin
          </p>
          <nav className="flex md:flex-col gap-1 text-sm">
            <NavLink href="/admin">Inicio</NavLink>
            <NavLink href="/admin/products">Productos</NavLink>
            <NavLink href="/admin/orders">Pedidos</NavLink>
            <NavLink href="/admin/users">Usuarios</NavLink>
          </nav>
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded hover:bg-[var(--color-brand-light)] font-semibold"
    >
      {children}
    </Link>
  );
}
