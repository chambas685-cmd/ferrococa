import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { readCart } from "@/lib/cart";
import { logout } from "@/app/actions/auth";

export async function Header() {
  const [user, cart] = await Promise.all([getCurrentUser(), readCart()]);
  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_ferrococa.png"
            alt="FERROCOCA"
            width={140}
            height={36}
            className="h-9 w-auto"
          />
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-1 text-xs sm:text-sm">
          <Link
            href="/products"
            className="px-2 sm:px-3 py-2 rounded hover:bg-white/10"
          >
            Productos
          </Link>
          <Link
            href="/cart"
            className="px-2 sm:px-3 py-2 rounded hover:bg-white/10 inline-flex items-center"
          >
            Carrito
            {cartCount > 0 && (
              <span className="ml-1.5 inline-block min-w-5 px-1 h-5 leading-5 text-xs text-center rounded-full bg-[var(--color-brand)] text-black font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="px-2 sm:px-3 py-2 rounded bg-[var(--color-brand)] text-black font-semibold hover:bg-[var(--color-brand-dark)]"
            >
              <span className="hidden sm:inline">Panel admin</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          )}

          {user ? (
            <form action={logout}>
              <button
                type="submit"
                className="px-2 sm:px-3 py-2 rounded border border-white/20 hover:bg-white/10"
                title={`Sesión: ${user.fullName}`}
              >
                Salir
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                className="px-2 sm:px-3 py-2 rounded hover:bg-white/10"
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className="px-2 sm:px-3 py-2 rounded bg-[var(--color-brand)] text-black font-semibold hover:bg-[var(--color-brand-dark)]"
              >
                <span className="hidden sm:inline">Registrarse</span>
                <span className="sm:hidden">Registro</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
