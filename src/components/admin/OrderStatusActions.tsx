"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/app/actions/orders";
import { statusLabel } from "@/lib/format";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const ALL: OrderStatus[] = ["PENDING", "CONTACTED", "COMPLETED", "CANCELLED"];

export function OrderStatusActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<OrderStatus | null>(null);
  const router = useRouter();

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {ALL.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending || s === status}
            onClick={() => setTarget(s)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border transition active:scale-95 ${
              s === status
                ? "bg-[var(--color-brand)] text-black border-[var(--color-brand)]"
                : "bg-white border-black/15 hover:bg-black/5"
            } disabled:cursor-not-allowed`}
          >
            {statusLabel(s)}
          </button>
        ))}
      </div>

      <ConfirmDialog
        open={target !== null}
        title="¿Cambiar estado del pedido?"
        message={
          target
            ? `El pedido pasará a estado "${statusLabel(target)}".`
            : ""
        }
        pending={pending}
        onCancel={() => setTarget(null)}
        onConfirm={() => {
          const newStatus = target;
          setTarget(null);
          if (!newStatus) return;
          startTransition(async () => {
            await updateOrderStatus(orderId, newStatus);
            router.refresh();
          });
        }}
      />
    </>
  );
}
