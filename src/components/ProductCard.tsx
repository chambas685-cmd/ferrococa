import type { Product } from "@prisma/client";
import { AddToCartButton } from "./AddToCartButton";
import { formatMoney } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="border border-black/10 rounded-lg overflow-hidden bg-white flex flex-col">
      <div className="aspect-[4/3] bg-[var(--color-brand-light)] grid place-items-center">
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
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-black text-[var(--color-brand-dark)]">
            {formatMoney(Number(product.price))}
          </span>
          <AddToCartButton productId={product.id} disabled={product.stock <= 0} />
        </div>
        {product.stock <= 0 && (
          <p className="text-xs text-red-700">Sin stock</p>
        )}
      </div>
    </article>
  );
}
