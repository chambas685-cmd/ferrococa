"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginUser, type ActionState } from "@/app/actions/auth";

const initial: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginUser, initial);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email?.[0]}
      />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        error={state.fieldErrors?.password?.[0]}
      />
      {state.error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="px-5 py-3 rounded bg-[var(--color-brand)] text-black font-bold hover:bg-[var(--color-brand-dark)] disabled:opacity-50"
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  name,
  ...rest
}: {
  label: string;
  error?: string;
  name: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{label}</span>
      <input
        name={name}
        {...rest}
        required
        className="border border-black/15 rounded px-3 py-2 focus:outline-none focus:border-[var(--color-brand)]"
      />
      {error && <span className="text-xs text-red-700">{error}</span>}
    </label>
  );
}
