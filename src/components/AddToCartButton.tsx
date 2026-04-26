"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";

export function AddToCartButton({
  productId,
  disabled,
  label = "Agregar",
}: {
  productId: string;
  disabled?: boolean;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await addToCart(productId, 1);
            if ("requireLogin" in res) {
              const next = encodeURIComponent(pathname || "/products");
              router.push(`/login?next=${next}`);
              return;
            }
            if ("error" in res) setError(res.error);
            router.refresh();
          })
        }
        className="px-3 py-2 rounded bg-[var(--color-brand)] text-black font-semibold hover:bg-[var(--color-brand-dark)] disabled:bg-black/20 disabled:text-black/50 disabled:cursor-not-allowed text-sm"
      >
        {pending ? "Añadiendo…" : label}
      </button>
      {error && (
        <span className="text-[10px] text-red-700 max-w-[160px] text-right leading-tight">
          {error}
        </span>
      )}
    </div>
  );
}
