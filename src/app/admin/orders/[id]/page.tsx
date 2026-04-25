import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";
import { OrderStatusActions } from "@/components/admin/OrderStatusActions";
import { ConfirmationWhatsAppButton } from "@/components/ConfirmationWhatsAppButton";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: true },
  });
  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-sm text-[var(--color-brand-dark)] font-semibold hover:underline"
      >
        ← Pedidos
      </Link>
      <h1 className="text-3xl font-black mt-2 mb-6">
        Pedido #{order.id.slice(-6).toUpperCase()}
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="border border-black/10 rounded-lg bg-white p-4">
          <h2 className="font-bold mb-3">Cliente</h2>
          <dl className="text-sm grid gap-2">
            <Row k="Nombre" v={order.user.fullName} />
            <Row k="Correo" v={order.user.email} />
          </dl>
          <hr className="my-4 border-black/10" />
          <h2 className="font-bold mb-3">Entrega</h2>
          <dl className="text-sm grid gap-2">
            <Row k="Dirección" v={order.address} />
            <Row k="Método de pago" v={order.paymentMethod === "CASH" ? "Efectivo" : "Transferencia"} />
            {order.notes && <Row k="Notas" v={order.notes} />}
          </dl>
        </section>

        <section className="border border-black/10 rounded-lg bg-white p-4">
          <h2 className="font-bold mb-3">Productos</h2>
          <ul className="divide-y divide-black/10">
            {order.items.map((i) => (
              <li
                key={i.id}
                className="py-2 flex items-center justify-between text-sm"
              >
                <span>
                  {i.quantity} × {i.name}
                </span>
                <span className="font-semibold">
                  {formatMoney(Number(i.unitPrice) * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
            <span className="font-bold">Total</span>
            <span className="text-xl font-black text-[var(--color-brand-dark)]">
              {formatMoney(Number(order.total))}
            </span>
          </div>
        </section>
      </div>

      <section className="mt-6 border border-black/10 rounded-lg bg-white p-4">
        <h2 className="font-bold mb-3">Estado del pedido</h2>
        <OrderStatusActions orderId={order.id} status={order.status} />
      </section>

      <section className="mt-6">
        <ConfirmationWhatsAppButton
          order={{
            orderId: order.id,
            buyerName: order.user.fullName,
            email: order.user.email,
            items: order.items.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              unitPrice: Number(i.unitPrice),
            })),
            total: Number(order.total),
            paymentMethod: order.paymentMethod,
            address: order.address,
            notes: order.notes,
          }}
        />
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2">
      <dt className="text-black/60">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}
