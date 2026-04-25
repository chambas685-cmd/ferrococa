import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { readCart } from "@/lib/cart";
import { logout } from "@/app/actions/auth";

export async function Header() {
  const [user, cart] = await Promise.all([getCurrentUser(), readCart()]);
  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block w-9 h-9 rounded bg-[var(--color-brand)] grid place-items-center font-black text-black">
            F
          </span>
          <span className="font-black tracking-tight text-xl">
            FERRO<span className="text-[var(--color-brand)]">COCA</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3 text-sm">
          <Link
            href="/products"
            className="px-3 py-2 rounded hover:bg-white/10"
          >
            Productos
          </Link>
          <Link href="/cart" className="px-3 py-2 rounded hover:bg-white/10">
            Carrito
            {cartCount > 0 && (
              <span className="ml-2 inline-block min-w-5 px-1 h-5 leading-5 text-xs text-center rounded-full bg-[var(--color-brand)] text-black font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="px-3 py-2 rounded bg-[var(--color-brand)] text-black font-semibold hover:bg-[var(--color-brand-dark)]"
            >
              Panel admin
            </Link>
          )}

          {user ? (
            <form action={logout} className="ml-1">
              <button
                type="submit"
                className="px-3 py-2 rounded border border-white/20 hover:bg-white/10"
                title={`Sesión: ${user.fullName}`}
              >
                Salir
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 rounded hover:bg-white/10"
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className="px-3 py-2 rounded bg-[var(--color-brand)] text-black font-semibold hover:bg-[var(--color-brand-dark)]"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
