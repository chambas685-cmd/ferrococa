"use client";

import { useEffect } from "react";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  type WhatsAppOrderInput,
} from "@/lib/whatsapp";

export function ConfirmationWhatsAppButton({
  order,
  autoOpen = false,
}: {
  order: WhatsAppOrderInput;
  autoOpen?: boolean;
}) {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(
    /\D/g,
    "",
  );
  const message = buildWhatsAppMessage(order);
  const url = number ? buildWhatsAppUrl(message, number) : null;

  useEffect(() => {
    if (autoOpen && url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, [autoOpen, url]);

  if (!url) {
    return (
      <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
        El número de WhatsApp del administrador aún no está configurado
        (NEXT_PUBLIC_WHATSAPP_NUMBER).
      </p>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full text-center px-5 py-4 rounded bg-[#25D366] text-white font-bold text-lg hover:opacity-90"
    >
      💬 Abrir WhatsApp y enviar pedido
    </a>
  );
}
