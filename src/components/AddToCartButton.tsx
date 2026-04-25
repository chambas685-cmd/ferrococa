"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";

export function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          await addToCart(productId, 1);
          router.refresh();
        })
      }
      className="px-3 py-2 rounded bg-[var(--color-brand)] text-black font-semibold hover:bg-[var(--color-brand-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      {pending ? "Añadiendo…" : "Agregar"}
    </button>
  );
}
