"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/app/actions/orders";
import { statusLabel } from "@/lib/format";

const ALL: OrderStatus[] = ["PENDING", "CONTACTED", "COMPLETED", "CANCELLED"];

export function OrderStatusActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {ALL.map((s) => (
        <button
          key={s}
          type="button"
          disabled={pending || s === status}
          onClick={() =>
            startTransition(async () => {
              await updateOrderStatus(orderId, s);
              router.refresh();
            })
          }
          className={`px-3 py-2 rounded text-sm font-semibold border ${
            s === status
              ? "bg-[var(--color-brand)] text-black border-[var(--color-brand)]"
              : "bg-white border-black/15 hover:bg-black/5"
          } disabled:cursor-not-allowed`}
        >
          {statusLabel(s)}
        </button>
      ))}
    </div>
  );
}
