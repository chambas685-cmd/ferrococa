"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createProduct,
  type ProductActionState,
} from "@/app/actions/products";

const initial: ProductActionState = {};

export function ProductFormCreate() {
  const [state, formAction, pending] = useActionState(createProduct, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid sm:grid-cols-2 gap-3"
    >
      <Field label="Nombre" name="name" error={state.fieldErrors?.name?.[0]} />
      <Field
        label="Precio (USD)"
        name="price"
        type="number"
        step="0.01"
        min="0"
        error={state.fieldErrors?.price?.[0]}
      />
      <Field
        label="Stock"
        name="stock"
        type="number"
        min="0"
        defaultValue={0}
        error={state.fieldErrors?.stock?.[0]}
      />
      <Field
        label="URL de imagen (opcional)"
        name="imageUrl"
        type="url"
        required={false}
        error={state.fieldErrors?.imageUrl?.[0]}
      />
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-semibold">Descripción</span>
        <textarea
          name="description"
          required
          rows={3}
          className="border border-black/15 rounded px-3 py-2"
        />
        {state.fieldErrors?.description?.[0] && (
          <span className="text-xs text-red-700">
            {state.fieldErrors.description[0]}
          </span>
        )}
      </label>
      {state.error && (
        <p className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="sm:col-span-2 px-5 py-3 rounded bg-[var(--color-brand)] text-black font-bold hover:bg-[var(--color-brand-dark)] disabled:opacity-50"
      >
        {pending ? "Creando…" : "Crear producto"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  name,
  required = true,
  ...rest
}: {
  label: string;
  error?: string;
  name: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{label}</span>
      <input
        name={name}
        required={required}
        {...rest}
        className="border border-black/15 rounded px-3 py-2"
      />
      {error && <span className="text-xs text-red-700">{error}</span>}
    </label>
  );
}
