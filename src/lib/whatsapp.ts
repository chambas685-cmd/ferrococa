/**
 * Genera el link de WhatsApp con el mensaje del pedido pre-armado.
 * El número del admin se toma de NEXT_PUBLIC_WHATSAPP_NUMBER (formato E.164 sin "+", ej. 593987654321).
 */
export type WhatsAppOrderInput = {
  buyerName: string;
  email: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  total: number;
  paymentMethod: "CASH" | "TRANSFER";
  address: string;
  notes?: string | null;
  orderId?: string;
};

export function getWhatsAppNumber(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
}

export function buildWhatsAppMessage(input: WhatsAppOrderInput): string {
  const formatMoney = (n: number) =>
    new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(n);

  const paymentLabel =
    input.paymentMethod === "CASH" ? "Efectivo" : "Transferencia";

  const lines = [
    "*FERROCOCA — Nuevo pedido*",
    input.orderId ? `Pedido #${input.orderId.slice(-6).toUpperCase()}` : null,
    "",
    `*Cliente:* ${input.buyerName}`,
    `*Correo:* ${input.email}`,
    "",
    "*Productos:*",
    ...input.items.map(
      (i) =>
        `• ${i.quantity} x ${i.name} — ${formatMoney(i.unitPrice)} c/u = ${formatMoney(
          i.unitPrice * i.quantity,
        )}`,
    ),
    "",
    `*Total:* ${formatMoney(input.total)}`,
    `*Método de pago:* ${paymentLabel}`,
    `*Dirección de envío:* ${input.address}`,
    input.notes ? `*Notas:* ${input.notes}` : null,
    "",
    "Por favor confirmar disponibilidad y coordinar entrega. ¡Gracias!",
  ].filter((l): l is string => l !== null);

  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string, number: string): string {
  // wa.me funciona en móvil y desktop.
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
