"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteProduct,
  toggleProductActive,
  updateProduct,
  type ProductActionState,
} from "@/app/actions/products";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type P = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  imageUrl: string;
  active: boolean;
};

export function ProductRowActions({ product }: { product: P }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const initial: ProductActionState = {};
  const [state, formAction, formPending] = useActionState(
    async (prev: ProductActionState, fd: FormData) => {
      const result = await updateProduct(product.id, prev, fd);
      if (result.ok) setEditing(false);
      return result;
    },
    initial,
  );

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => setEditing((v) => !v)}
        className="text-sm font-semibold text-[var(--color-brand-dark)] hover:underline"
      >
        {editing ? "Cancelar" : "Editar"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirmToggle(true)}
        className="text-sm font-semibold hover:underline"
      >
        {product.active ? "Ocultar" : "Activar"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirmDelete(true)}
        className="text-sm font-semibold text-red-700 hover:underline"
      >
        Eliminar
      </button>

      {editing && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm grid place-items-center z-40 p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => !formPending && setEditing(false)}
        >
          <form
            ref={formRef}
            action={formAction}
            onSubmit={(e) => {
              e.preventDefault();
              setConfirmSave(true);
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-5 w-full max-w-2xl grid sm:grid-cols-2 gap-3 animate-[popIn_0.18s_cubic-bezier(0.34,1.56,0.64,1)] shadow-2xl"
          >
            <h3 className="sm:col-span-2 text-xl font-black border-b border-black/10 pb-3 mb-1">
              Editar: {product.name}
            </h3>
            <Field label="Nombre" name="name" defaultValue={product.name} />
            <Field
              label="Stock"
              name="stock"
              type="number"
              min="0"
              defaultValue={product.stock}
            />
            <Field
              label="Precio (USD)"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.price}
              prefix="$"
            />
            <Field
              label="Descuento (opcional)"
              name="discountPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.discountPrice ?? ""}
              required={false}
              prefix="$"
              error={state.fieldErrors?.discountPrice?.[0]}
            />
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-sm font-semibold">URL de imagen</span>
              <input
                name="imageUrl"
                type="url"
                defaultValue={product.imageUrl}
                className="border border-black/15 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 focus:border-[var(--color-brand)] transition"
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-sm font-semibold">Descripción</span>
              <textarea
                name="description"
                rows={3}
                defaultValue={product.description}
                required
                className="border border-black/15 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 focus:border-[var(--color-brand)] transition"
              />
            </label>
            {state.error && (
              <p className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {state.error}
              </p>
            )}
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-black/10">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-lg border border-black/15 hover:bg-black/5 active:scale-95 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={formPending}
                className="px-5 py-2 rounded-lg bg-[var(--color-brand)] text-black font-bold hover:bg-[var(--color-brand-dark)] hover:text-white active:scale-95 transition disabled:opacity-50"
              >
                {formPending ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar este producto?"
        message={`"${product.name}" se eliminará de la tienda. Si tiene pedidos asociados, se ocultará en lugar de eliminarse.`}
        pending={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          startTransition(async () => {
            await deleteProduct(product.id);
            router.refresh();
          });
        }}
      />

      <ConfirmDialog
        open={confirmToggle}
        title={product.active ? "¿Ocultar producto?" : "¿Reactivar producto?"}
        message={
          product.active
            ? `"${product.name}" dejará de aparecer en el catálogo de los clientes.`
            : `"${product.name}" volverá a aparecer en el catálogo.`
        }
        pending={pending}
        onCancel={() => setConfirmToggle(false)}
        onConfirm={() => {
          setConfirmToggle(false);
          startTransition(async () => {
            await toggleProductActive(product.id);
            router.refresh();
          });
        }}
      />

      <ConfirmDialog
        open={confirmSave}
        title="¿Guardar cambios?"
        message={`Se actualizarán los datos de "${product.name}".`}
        pending={formPending}
        onCancel={() => setConfirmSave(false)}
        onConfirm={() => {
          setConfirmSave(false);
          if (formRef.current) {
            const fd = new FormData(formRef.current);
            formAction(fd);
          }
        }}
      />
    </div>
  );
}

function Field({
  label,
  error,
  prefix,
  required = true,
  ...rest
}: {
  label: string;
  error?: string;
  prefix?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{label}</span>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 font-semibold">
            {prefix}
          </span>
        )}
        <input
          required={required}
          {...rest}
          className={`w-full border rounded-lg py-2 ${
            prefix ? "pl-7 pr-3" : "px-3"
          } focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 focus:border-[var(--color-brand)] transition ${
            error ? "border-red-400" : "border-black/15"
          }`}
        />
      </div>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </label>
  );
}
