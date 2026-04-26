"use client";

import { useEffect, useState } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { formatMoney } from "@/lib/format";

type Props = {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    discountPrice: number | null;
    stock: number;
    imageUrl: string | null;
  };
};

export function ProductDetailButton({ product }: Props) {
  const [open, setOpen] = useState(false);

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;
  const hasDiscount =
    product.discountPrice !== null && product.discountPrice < product.price;
  const effectivePrice = hasDiscount
    ? (product.discountPrice as number)
    : product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - (product.discountPrice as number) / product.price) * 100)
    : 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded border border-black/15 bg-white text-black font-semibold hover:bg-black/5 active:scale-95 transition text-sm"
      >
        Ver
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`product-${product.id}-title`}
          className="fixed inset-0 z-50 grid place-items-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.18s_ease-out]"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl relative animate-[popIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-black grid place-items-center shadow-md border border-black/10 active:scale-90 transition text-lg font-bold"
            >
              ×
            </button>

            <div className="grid md:grid-cols-2 gap-0">
              <div
                className={`relative aspect-square md:aspect-auto md:min-h-[360px] bg-[var(--color-brand-light)] grid place-items-center ${
                  outOfStock ? "opacity-70 grayscale" : ""
                }`}
              >
                {outOfStock && (
                  <span className="absolute top-3 left-3 z-10 bg-black text-white text-xs font-bold px-2 py-1 rounded">
                    AGOTADO
                  </span>
                )}
                {!outOfStock && hasDiscount && (
                  <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                    -{discountPct}%
                  </span>
                )}
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-7xl">🧰</span>
                )}
              </div>

              <div className="p-5 sm:p-6 flex flex-col gap-4">
                <h2
                  id={`product-${product.id}-title`}
                  className="text-2xl sm:text-3xl font-black leading-tight"
                >
                  {product.name}
                </h2>

                <div className="flex items-end gap-3 flex-wrap">
                  {hasDiscount && (
                    <span className="text-base text-black/50 line-through">
                      {formatMoney(product.price)}
                    </span>
                  )}
                  <span className="text-3xl font-black text-[var(--color-brand-dark)]">
                    {formatMoney(effectivePrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      Ahorras {formatMoney(product.price - effectivePrice)}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide font-bold text-black/50 mb-1">
                    Descripción
                  </p>
                  <p className="text-sm text-black/80 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-xs uppercase tracking-wide font-bold text-black/50">
                    Stock:
                  </p>
                  {outOfStock ? (
                    <span className="text-sm font-bold text-red-700">
                      Agotado
                    </span>
                  ) : lowStock ? (
                    <span className="text-sm font-bold text-[var(--color-brand-dark)]">
                      ¡Solo quedan {product.stock}!
                    </span>
                  ) : (
                    <span className="text-sm font-semibold">
                      {product.stock} disponibles
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-2 flex justify-end">
                  <AddToCartButton
                    productId={product.id}
                    disabled={outOfStock}
                    label={outOfStock ? "Agotado" : "Agregar al carrito"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
