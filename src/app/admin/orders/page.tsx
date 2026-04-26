import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDateTime, statusLabel } from "@/lib/format";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, items: true },
  });

  return (
    <div>
      <h1 className="text-3xl font-black mb-6">Pedidos</h1>
      <div className="border border-black/10 rounded-lg bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-black/5 text-left">
            <tr>
              <th className="p-3">Pedido</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Total</th>
              <th className="p-3">Pago</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-black/60">
                  Aún no hay pedidos.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td className="p-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-bold hover:underline"
                    >
                      #{o.id.slice(-6).toUpperCase()}
                    </Link>
                    <div className="text-xs text-black/60">
                      {o.items.length} ítem(s)
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold">{o.user.fullName}</div>
                    <div className="text-xs text-black/60">{o.user.email}</div>
                  </td>
                  <td className="p-3 font-bold">
                    {formatMoney(Number(o.total))}
                  </td>
                  <td className="p-3">
                    {o.paymentMethod === "CASH" ? "Efectivo" : "Transferencia"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-3 text-xs text-black/60">
                    {formatDateTime(o.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
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
