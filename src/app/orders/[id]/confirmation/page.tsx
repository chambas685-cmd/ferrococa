import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatMoney } from "@/lib/format";
import { ConfirmationWhatsAppButton } from "@/components/ConfirmationWhatsAppButton";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: true },
  });

  if (!order) notFound();
  if (order.userId !== user.id && user.role !== "ADMIN") notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-[var(--color-brand-light)] border border-[var(--color-brand)] rounded-lg p-5 mb-6">
        <h1 className="text-2xl font-black">¡Pedido registrado!</h1>
        <p className="text-sm mt-1">
          Pedido <span className="font-mono">#{order.id.slice(-6).toUpperCase()}</span>{" "}
          guardado correctamente. Ahora coordina con FERROCOCA por WhatsApp.
        </p>
      </div>

      <section className="border border-black/10 rounded-lg bg-white p-4 mb-6">
        <h2 className="font-bold mb-2">Detalle</h2>
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
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Row k="Método de pago" v={order.paymentMethod === "CASH" ? "Efectivo" : "Transferencia"} />
          <Row k="Dirección" v={order.address} />
          <Row k="Cliente" v={order.user.fullName} />
          <Row k="Correo" v={order.user.email} />
          {order.notes && <Row k="Notas" v={order.notes} />}
        </dl>
      </section>

      <ConfirmationWhatsAppButton
        autoOpen
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

      <div className="mt-6 text-center">
        <Link href="/products" className="text-[var(--color-brand-dark)] font-semibold hover:underline">
          Seguir comprando →
        </Link>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-black/60 text-xs uppercase tracking-wide">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}
