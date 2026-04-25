"use client";

import { useActionState, useState } from "react";
import { createOrder, type CheckoutState } from "@/app/actions/orders";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

const initial: CheckoutState = {};

type Item = { productId: string; name: string; unitPrice: number; quantity: number };

export function CheckoutForm({
  items,
  total,
  buyer,
  whatsappNumber,
}: {
  items: Item[];
  total: number;
  buyer: { fullName: string; email: string };
  whatsappNumber?: string;
}) {
  const [state, formAction, pending] = useActionState(createOrder, initial);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">(
    "CASH",
  );
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const envNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const number = (whatsappNumber ?? envNumber).replace(/\D/g, "");

  const canSubmit = address.trim().length >= 5;

  const waMessage = buildWhatsAppMessage({
    buyerName: buyer.fullName,
    email: buyer.email,
    items,
    total,
    paymentMethod,
    address,
    notes,
  });

  const waUrl =
    number && canSubmit ? buildWhatsAppUrl(waMessage, number) : null;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <fieldset className="border border-black/10 rounded-lg bg-white p-4">
        <legend className="px-2 font-bold">Método de pago</legend>
        <div className="flex flex-col gap-2 mt-2">
          {(
            [
              ["CASH", "Efectivo (pago contra entrega)"],
              ["TRANSFER", "Transferencia bancaria"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                value={value}
                checked={paymentMethod === value}
                onChange={() => setPaymentMethod(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Dirección de envío</span>
        <input
          name="address"
          required
          minLength={5}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Calle, número, ciudad, referencia"
          className="border border-black/15 rounded px-3 py-2 focus:outline-none focus:border-[var(--color-brand)]"
        />
        {state.fieldErrors?.address?.[0] && (
          <span className="text-xs text-red-700">
            {state.fieldErrors.address[0]}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Notas (opcional)</span>
        <textarea
          name="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border border-black/15 rounded px-3 py-2 focus:outline-none focus:border-[var(--color-brand)]"
        />
      </label>

      {state.error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={pending || !canSubmit}
          className="flex-1 px-5 py-3 rounded bg-black text-white font-bold hover:bg-black/80 disabled:opacity-50"
        >
          {pending ? "Procesando…" : "Confirmar pedido"}
        </button>

        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-5 py-3 rounded bg-[#25D366] text-white font-bold hover:opacity-90 inline-flex items-center justify-center gap-2"
          >
            <span aria-hidden>💬</span> Coordinar por WhatsApp
          </a>
        ) : (
          <button
            type="button"
            disabled
            title={
              !number
                ? "Configura NEXT_PUBLIC_WHATSAPP_NUMBER en el .env"
                : "Completa la dirección para activar"
            }
            className="flex-1 px-5 py-3 rounded bg-[#25D366]/40 text-white font-bold cursor-not-allowed"
          >
            💬 Coordinar por WhatsApp
          </button>
        )}
      </div>

      <p className="text-xs text-black/60">
        Al confirmar, registramos tu pedido y abrimos WhatsApp con el detalle
        para que coordines la entrega con FERROCOCA.
      </p>
    </form>
  );
}
