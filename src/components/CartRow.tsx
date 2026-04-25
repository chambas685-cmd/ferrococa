"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeFromCart, setCartQuantity } from "@/app/actions/cart";
import { formatMoney } from "@/lib/format";

type Item = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl: string | null;
};

export function CartRow({ item }: { item: Item }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="w-16 h-16 rounded bg-[var(--color-brand-light)] grid place-items-center shrink-0 overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">🧰</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{item.name}</div>
        <div className="text-sm text-black/60">
          {formatMoney(item.unitPrice)} c/u
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setCartQuantity(item.productId, Math.max(1, item.quantity - 1));
              router.refresh();
            })
          }
          className="w-8 h-8 rounded border border-black/10 hover:bg-black/5"
          aria-label="Disminuir"
        >
          −
        </button>
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setCartQuantity(item.productId, item.quantity + 1);
              router.refresh();
            })
          }
          className="w-8 h-8 rounded border border-black/10 hover:bg-black/5"
          aria-label="Aumentar"
        >
          +
        </button>
      </div>

      <div className="w-24 text-right font-bold">
        {formatMoney(item.subtotal)}
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await removeFromCart(item.productId);
            router.refresh();
          })
        }
        className="text-sm text-red-700 hover:underline"
      >
        Quitar
      </button>
    </div>
  );
}
