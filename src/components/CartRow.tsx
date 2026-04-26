"use client";

import { useState, useTransition } from "react";
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
  stock: number;
};

export function CartRow({ item }: { item: Item }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const atMax = item.quantity >= item.stock;

  const update = (next: number) => {
    startTransition(async () => {
      setError(null);
      const res = await setCartQuantity(item.productId, next);
      if ("requireLogin" in res) {
        router.push("/login?next=/cart");
        return;
      }
      if ("error" in res) setError(res.error);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col p-4 gap-3 sm:flex-row sm:items-center sm:gap-4">
      {/* Imagen + nombre */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
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
          <div className="text-xs sm:text-sm text-black/60">
            {formatMoney(item.unitPrice)} c/u · stock: {item.stock}
          </div>
        </div>
      </div>

      {/* Controles + subtotal + quitar */}
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => update(Math.max(1, item.quantity - 1))}
            className="w-8 h-8 rounded border border-black/10 hover:bg-black/5 disabled:opacity-50"
            aria-label="Disminuir"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold">{item.quantity}</span>
          <button
            type="button"
            disabled={pending || atMax}
            onClick={() => update(item.quantity + 1)}
            className="w-8 h-8 rounded border border-black/10 hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Aumentar"
            title={atMax ? "Sin más stock disponible" : ""}
          >
            +
          </button>
        </div>

        <div className="font-bold whitespace-nowrap">
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

      {error && (
        <p className="text-xs text-red-700 sm:basis-full">{error}</p>
      )}
    </div>
  );
}
