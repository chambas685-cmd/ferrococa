"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteProduct,
  toggleProductActive,
  updateProduct,
  type ProductActionState,
} from "@/app/actions/products";

type P = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  active: boolean;
};

export function ProductRowActions({ product }: { product: P }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const update = updateProduct.bind(null, product.id);
  const initial: ProductActionState = {};
  const [state, formAction, formPending] = useActionState(update, initial);

  if (state.ok) {
    // Cierra después de guardado.
    queueMicrotask(() => setEditing(false));
  }

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
        onClick={() =>
          startTransition(async () => {
            await toggleProductActive(product.id);
            router.refresh();
          })
        }
        className="text-sm font-semibold hover:underline"
      >
        {product.active ? "Ocultar" : "Activar"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("¿Eliminar este producto?")) return;
          startTransition(async () => {
            await deleteProduct(product.id);
            router.refresh();
          });
        }}
        className="text-sm font-semibold text-red-700 hover:underline"
      >
        Eliminar
      </button>

      {editing && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4">
          <form
            action={formAction}
            className="bg-white rounded-lg p-5 w-full max-w-lg grid sm:grid-cols-2 gap-3"
          >
            <h3 className="sm:col-span-2 text-xl font-black">
              Editar: {product.name}
            </h3>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Nombre</span>
              <input
                name="name"
                defaultValue={product.name}
                required
                className="border border-black/15 rounded px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Precio</span>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product.price}
                required
                className="border border-black/15 rounded px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Stock</span>
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue={product.stock}
                required
                className="border border-black/15 rounded px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold">URL de imagen</span>
              <input
                name="imageUrl"
                type="url"
                defaultValue={product.imageUrl}
                className="border border-black/15 rounded px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-sm font-semibold">Descripción</span>
              <textarea
                name="description"
                rows={3}
                defaultValue={product.description}
                required
                className="border border-black/15 rounded px-3 py-2"
              />
            </label>
            {state.error && (
              <p className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                {state.error}
              </p>
            )}
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded border border-black/15 hover:bg-black/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={formPending}
                className="px-5 py-2 rounded bg-[var(--color-brand)] text-black font-bold hover:bg-[var(--color-brand-dark)] disabled:opacity-50"
              >
                {formPending ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
