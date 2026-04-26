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
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 grid md:grid-cols-[240px_1fr] gap-4 sm:gap-6">
        <aside className="md:sticky md:top-4 self-start">
          <div className="border border-black/10 rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-dark)] text-black">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">
                Panel
              </p>
              <p className="font-black leading-tight">Administración</p>
            </div>
            <nav className="flex flex-wrap md:flex-col gap-1 text-sm p-2">
              <NavLink href="/admin" icon="📊">
                Resumen
              </NavLink>
              <NavLink href="/admin/products" icon="📦">
                Productos
              </NavLink>
              <NavLink href="/admin/orders" icon="🧾">
                Pedidos
              </NavLink>
              <NavLink href="/admin/users" icon="👥">
                Usuarios
              </NavLink>
            </nav>
            <div className="px-4 py-3 border-t border-black/5 text-xs">
              <p className="text-black/60">Sesión</p>
              <p className="font-bold truncate" title={user.fullName}>
                {user.fullName}
              </p>
              <p className="text-black/50 truncate" title={user.email}>
                {user.email}
              </p>
            </div>
          </div>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--color-brand-light)] font-semibold transition"
    >
      <span className="text-base">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
