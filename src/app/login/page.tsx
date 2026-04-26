import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/products");

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-2">Iniciar sesión</h1>
      <p className="text-black/60 mb-6">
        Ingresa con tu correo y contraseña.
      </p>
      <Suspense fallback={<div className="text-sm text-black/60">Cargando…</div>}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-sm text-black/70">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="text-[var(--color-brand-dark)] font-semibold hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
