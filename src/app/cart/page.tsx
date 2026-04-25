import Link from "next/link";
import { getCartWithProducts } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { CartRow } from "@/components/CartRow";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCartWithProducts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-6">Tu carrito</h1>

      {cart.items.length === 0 ? (
        <div className="border border-black/10 rounded-lg p-8 text-center bg-white">
          <p className="text-black/60 mb-4">Tu carrito está vacío.</p>
          <Link
            href="/products"
            className="inline-block px-5 py-3 rounded bg-[var(--color-brand)] text-black font-semibold hover:bg-[var(--color-brand-dark)]"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <>
          <div className="border border-black/10 rounded-lg bg-white divide-y divide-black/10">
            {cart.items.map((i) => (
              <CartRow key={i.productId} item={i} />
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-2xl font-black">
              Total: {formatMoney(cart.total)}
            </div>
            <Link
              href="/checkout"
              className="px-6 py-3 rounded bg-[var(--color-brand)] text-black font-semibold hover:bg-[var(--color-brand-dark)] text-center"
            >
              Continuar al checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
