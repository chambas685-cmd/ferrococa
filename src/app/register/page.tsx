import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/products");

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-2">Crear cuenta</h1>
      <p className="text-black/60 mb-6">
        Regístrate con tu nombre, correo y contraseña.
      </p>
      <RegisterForm />
      <p className="mt-6 text-sm text-black/70">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="text-[var(--color-brand-dark)] font-semibold hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
