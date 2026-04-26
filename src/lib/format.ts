import type { OrderStatus } from "@prisma/client";

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "PENDIENTE",
  CONTACTED: "CONTACTADO",
  COMPLETED: "COMPLETADO",
  CANCELLED: "CANCELADO",
};

export function statusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABEL[status] ?? status;
}
