import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";

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
      <h1 className="text-3xl font-black mb-6">Resumen</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Usuarios" value={usersCount} />
        <Stat label="Productos" value={productsCount} />
        <Stat label="Pedidos pendientes" value={pendingCount} highlight />
        <Stat
          label="Ventas completadas"
          value={formatMoney(Number(totalSales._sum.total ?? 0))}
        />
      </div>

      <div className="border border-black/10 rounded-lg bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">Últimos pedidos</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-[var(--color-brand-dark)] font-semibold hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-black/60 text-sm">Aún no hay pedidos.</p>
        ) : (
          <ul className="divide-y divide-black/10">
            {recentOrders.map((o) => (
              <li
                key={o.id}
                className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm"
              >
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="hover:underline truncate"
                >
                  #{o.id.slice(-6).toUpperCase()} — {o.user.fullName}
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-black/5 font-semibold">
                    {o.status}
                  </span>
                  <span className="font-bold">
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
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-lg p-4 ${
        highlight
          ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]"
          : "border-black/10 bg-white"
      }`}
    >
      <div className="text-xs uppercase text-black/60 font-bold">{label}</div>
      <div className="text-2xl font-black mt-1">{value}</div>
    </div>
  );
}
