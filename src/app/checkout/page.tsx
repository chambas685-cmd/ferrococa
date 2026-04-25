import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getCartWithProducts } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { CheckoutForm } from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/checkout");
  }

  const cart = await getCartWithProducts();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-black mb-4">Tu carrito está vacío</h1>
        <Link
          href="/products"
          className="inline-block px-5 py-3 rounded bg-[var(--color-brand)] text-black font-semibold hover:bg-[var(--color-brand-dark)]"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-6">Finalizar compra</h1>

      <section className="border border-black/10 rounded-lg bg-white p-4 mb-6">
        <h2 className="font-bold mb-2">Resumen del pedido</h2>
        <ul className="divide-y divide-black/10">
          {cart.items.map((i) => (
            <li
              key={i.productId}
              className="py-2 flex items-center justify-between text-sm"
            >
              <span>
                {i.quantity} × {i.name}
              </span>
              <span className="font-semibold">{formatMoney(i.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
          <span className="font-bold">Total</span>
          <span className="text-xl font-black text-[var(--color-brand-dark)]">
            {formatMoney(cart.total)}
          </span>
        </div>
      </section>

      <CheckoutForm
        items={cart.items}
        total={cart.total}
        buyer={{
          fullName: user.fullName,
          email: user.email,
        }}
      />
    </div>
  );
}
