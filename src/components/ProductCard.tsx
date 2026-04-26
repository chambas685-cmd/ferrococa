import type { Product } from "@prisma/client";
import { AddToCartButton } from "./AddToCartButton";
import { formatMoney } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;
  const price = Number(product.price);
  const discount =
    product.discountPrice != null ? Number(product.discountPrice) : null;
  const hasDiscount = discount !== null && discount < price;
  const effectivePrice = hasDiscount ? (discount as number) : price;
  const discountPct = hasDiscount
    ? Math.round((1 - (discount as number) / price) * 100)
    : 0;

  return (
    <article className="border border-black/10 rounded-lg overflow-hidden bg-white flex flex-col relative shadow-sm hover:shadow-md transition-shadow">
      {outOfStock && (
        <span className="absolute top-2 right-2 z-10 bg-black text-white text-xs font-bold px-2 py-1 rounded">
          AGOTADO
        </span>
      )}
      {!outOfStock && hasDiscount && (
        <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
          -{discountPct}%
        </span>
      )}
      <div
        className={`aspect-[4/3] bg-[var(--color-brand-light)] grid place-items-center ${
          outOfStock ? "opacity-60 grayscale" : ""
        }`}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">🧰</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold leading-tight">{product.name}</h3>
        <p className="text-sm text-black/60 line-clamp-2">
          {product.description}
        </p>
        {lowStock && (
          <p className="text-xs font-semibold text-[var(--color-brand-dark)]">
            ¡Solo quedan {product.stock}!
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col leading-tight">
            {hasDiscount && (
              <span className="text-xs text-black/50 line-through">
                {formatMoney(price)}
              </span>
            )}
            <span className="text-lg font-black text-[var(--color-brand-dark)]">
              {formatMoney(effectivePrice)}
            </span>
          </div>
          <AddToCartButton
            productId={product.id}
            disabled={outOfStock}
            label={outOfStock ? "Agotado" : "Agregar"}
          />
        </div>
      </div>
    </article>
  );
}
