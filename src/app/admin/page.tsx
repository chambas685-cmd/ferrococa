import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDateTime, statusLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [usersCount, productsCount, pendingCount, recentOrders, totalSales] =
    await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: true },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: "COMPLETED" },
      }),
    ]);

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest font-bold text-black/50">
          FERROCOCA · Panel de control
        </p>
        <h1 className="text-3xl sm:text-4xl font-black mt-1">Resumen general</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat
          icon="👥"
          label="Usuarios"
          value={usersCount}
          accent="from-blue-500/10 to-transparent"
        />
        <Stat
          icon="📦"
          label="Productos"
          value={productsCount}
          accent="from-emerald-500/10 to-transparent"
        />
        <Stat
          icon="⏳"
          label="Pendientes"
          value={pendingCount}
          accent="from-[var(--color-brand)]/30 to-transparent"
          highlight={pendingCount > 0}
        />
        <Stat
          icon="💰"
          label="Ventas completadas"
          value={formatMoney(Number(totalSales._sum.total ?? 0))}
          accent="from-green-500/10 to-transparent"
        />
      </div>

      <div className="border border-black/10 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/5">
          <h2 className="font-black">Últimos pedidos</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-[var(--color-brand-dark)] font-semibold hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-black/60 text-sm p-6 text-center">
            Aún no hay pedidos.
          </p>
        ) : (
          <ul className="divide-y divide-black/10">
            {recentOrders.map((o) => (
              <li
                key={o.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm p-4 hover:bg-black/[.02] transition"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-semibold hover:underline truncate block"
                  >
                    #{o.id.slice(-6).toUpperCase()} — {o.user.fullName}
                  </Link>
                  <p className="text-xs text-black/50">
                    {formatDateTime(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill status={o.status} />
                  <span className="font-black text-[var(--color-brand-dark)]">
                    {formatMoney(Number(o.total))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
  highlight,
}: {
  icon: string;
  label: string;
  value: string | number;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition ${
        highlight
          ? "border-[var(--color-brand)]"
          : "border-black/10"
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accent} pointer-events-none`}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-black/60 tracking-wide">
            {label}
          </span>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="text-2xl sm:text-3xl font-black mt-2">{value}</div>
      </div>
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: "PENDING" | "CONTACTED" | "COMPLETED" | "CANCELLED";
}) {
  const cls =
    status === "PENDING"
      ? "bg-yellow-100 text-yellow-900"
      : status === "CONTACTED"
        ? "bg-blue-100 text-blue-900"
        : status === "COMPLETED"
          ? "bg-green-100 text-green-900"
          : "bg-red-100 text-red-900";
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${cls}`}>
      {statusLabel(status)}
    </span>
  );
}
