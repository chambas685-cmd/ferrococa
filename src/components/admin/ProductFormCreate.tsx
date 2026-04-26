"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProduct,
  type ProductActionState,
} from "@/app/actions/products";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatMoney } from "@/lib/format";

const initial: ProductActionState = {};

export function ProductFormCreate() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [state, formAction, pending] = useActionState(
    async (prev: ProductActionState, fd: FormData) => {
      const result = await createProduct(prev, fd);
      if (result.ok) {
        setName("");
        setPrice("");
        setDiscountPrice("");
        setStock("0");
        setImageUrl("");
        setDescription("");
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 2500);
      }
      return result;
    },
    initial,
  );

  const priceNum = Number(price);
  const discountNum = discountPrice ? Number(discountPrice) : null;
  const hasValidDiscount =
    discountNum !== null &&
    !Number.isNaN(discountNum) &&
    discountNum > 0 &&
    !Number.isNaN(priceNum) &&
    discountNum < priceNum;

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={(e) => {
          e.preventDefault();
          setConfirmOpen(true);
        }}
        className="grid gap-5"
      >
        <Section
          title="1. Información básica"
          subtitle="Datos que verá el cliente."
        >
          <div className="grid gap-4">
            <Field
              label="Nombre del producto"
              hint="Ej: Tanque de agua 1000L"
              name="name"
              value={name}
              onChange={setName}
              error={state.fieldErrors?.name?.[0]}
            />
            <Textarea
              label="Descripción"
              hint="Características, uso, material, etc."
              name="description"
              value={description}
              onChange={setDescription}
              error={state.fieldErrors?.description?.[0]}
            />
          </div>
        </Section>

        <Section
          title="2. Precio y descuento"
          subtitle="El descuento es opcional. Si lo agregas, el precio original se mostrará tachado."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Precio (USD)"
              hint="Precio normal del producto"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={setPrice}
              error={state.fieldErrors?.price?.[0]}
              prefix="$"
            />
            <Field
              label="Precio con descuento (opcional)"
              hint="Déjalo vacío si no hay descuento"
              name="discountPrice"
              type="number"
              step="0.01"
              min="0"
              value={discountPrice}
              onChange={setDiscountPrice}
              required={false}
              error={state.fieldErrors?.discountPrice?.[0]}
              prefix="$"
            />
          </div>
          {hasValidDiscount && (
            <div className="mt-3 flex items-center gap-3 rounded-lg bg-[var(--color-brand-light)] border border-[var(--color-brand)]/40 px-3 py-2 text-sm">
              <span className="text-black/60 line-through">
                {formatMoney(priceNum)}
              </span>
              <span className="font-black text-[var(--color-brand-dark)]">
                {formatMoney(discountNum as number)}
              </span>
              <span className="ml-auto text-xs font-bold text-red-600">
                -{Math.round((1 - (discountNum as number) / priceNum) * 100)}%
              </span>
            </div>
          )}
        </Section>

        <Section
          title="3. Inventario"
          subtitle="Cantidad disponible para la venta."
        >
          <Field
            label="Stock"
            hint="Si está en 0 se mostrará como AGOTADO"
            name="stock"
            type="number"
            min="0"
            value={stock}
            onChange={setStock}
            error={state.fieldErrors?.stock?.[0]}
          />
        </Section>

        <Section
          title="4. Imagen"
          subtitle="URL de una imagen pública del producto (opcional)."
        >
          <Field
            label="URL de imagen"
            hint="Ej: https://...imagen.jpg"
            name="imageUrl"
            type="url"
            value={imageUrl}
            onChange={setImageUrl}
            required={false}
            error={state.fieldErrors?.imageUrl?.[0]}
          />
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Vista previa"
              className="mt-3 w-32 h-32 object-cover rounded-lg border border-black/10"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}
        </Section>

        {state.error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2 animate-[slideUp_0.2s_ease-out]">
            Producto creado correctamente.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="px-6 py-3 rounded-lg bg-[var(--color-brand)] text-black font-bold hover:bg-[var(--color-brand-dark)] hover:text-white active:scale-[0.98] transition disabled:opacity-50 shadow"
          >
            {pending ? "Creando…" : "Crear producto"}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Crear este producto?"
        message={`Se publicará "${name || "el producto"}" en la tienda${
          hasValidDiscount
            ? ` con descuento del ${Math.round((1 - (discountNum as number) / priceNum) * 100)}%.`
            : "."
        }`}
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          if (formRef.current) {
            const fd = new FormData(formRef.current);
            formAction(fd);
          }
        }}
      />
    </>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-black/10 rounded-xl bg-white p-4 sm:p-5">
      <div className="mb-3">
        <h3 className="font-black text-base">{title}</h3>
        {subtitle && (
          <p className="text-xs text-black/60 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  name,
  required = true,
  prefix,
  value,
  onChange,
  ...rest
}: {
  label: string;
  hint?: string;
  error?: string;
  name: string;
  required?: boolean;
  prefix?: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "name"
>) {
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
          name={name}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
          className={`w-full border rounded-lg py-2 ${
            prefix ? "pl-7 pr-3" : "px-3"
          } focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 focus:border-[var(--color-brand)] transition ${
            error ? "border-red-400" : "border-black/15"
          }`}
        />
      </div>
      {hint && !error && (
        <span className="text-xs text-black/50">{hint}</span>
      )}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </label>
  );
}

function Textarea({
  label,
  hint,
  error,
  name,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  error?: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{label}</span>
      <textarea
        name={name}
        required
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 focus:border-[var(--color-brand)] transition ${
          error ? "border-red-400" : "border-black/15"
        }`}
      />
      {hint && !error && <span className="text-xs text-black/50">{hint}</span>}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </label>
  );
}
