"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import {
  adminResetPassword,
  adminToggleAdmin,
} from "@/app/actions/users";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function UserRowActions({
  userId,
  role,
}: {
  userId: string;
  role: Role;
}) {
  const [pending, startTransition] = useTransition();
  const [showReset, setShowReset] = useState(false);
  const [confirmRole, setConfirmRole] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setShowReset((v) => !v);
          setMsg(null);
          setErr(null);
        }}
        className="text-sm font-semibold text-[var(--color-brand-dark)] hover:underline"
      >
        Resetear contraseña
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirmRole(true)}
        className="text-sm font-semibold hover:underline"
      >
        {role === "ADMIN" ? "Quitar admin" : "Hacer admin"}
      </button>

      {err && <span className="text-xs text-red-700 w-full">{err}</span>}

      {showReset && (
        <div className="w-full mt-2 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center animate-[slideUp_0.18s_ease-out]">
          <input
            type="text"
            placeholder="Nueva contraseña (mín 6)"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            className="border border-black/15 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 focus:border-[var(--color-brand)] transition"
          />
          <button
            type="button"
            disabled={pending || newPwd.length < 6}
            onClick={() => setConfirmReset(true)}
            className="px-3 py-2 rounded-lg bg-[var(--color-brand)] text-black font-bold text-sm disabled:opacity-50 active:scale-95 transition"
          >
            Guardar
          </button>
        </div>
      )}
      {msg && <span className="text-xs text-green-700 w-full">{msg}</span>}

      <ConfirmDialog
        open={confirmRole}
        title={
          role === "ADMIN"
            ? "¿Quitar privilegios de administrador?"
            : "¿Convertir en administrador?"
        }
        message={
          role === "ADMIN"
            ? "El usuario perderá acceso al panel admin."
            : "El usuario podrá gestionar productos, pedidos y otros usuarios."
        }
        pending={pending}
        onCancel={() => setConfirmRole(false)}
        onConfirm={() => {
          setConfirmRole(false);
          startTransition(async () => {
            const r = await adminToggleAdmin(userId);
            if (r.error) setErr(r.error);
            else router.refresh();
          });
        }}
      />

      <ConfirmDialog
        open={confirmReset}
        title="¿Resetear contraseña?"
        message="Asegúrate de compartir la nueva contraseña con el usuario."
        pending={pending}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          startTransition(async () => {
            setMsg(null);
            setErr(null);
            const r = await adminResetPassword(userId, newPwd);
            if (r.error) setErr(r.error);
            else {
              setMsg(
                "Contraseña actualizada. Comparte la nueva con el usuario.",
              );
              setNewPwd("");
              setShowReset(false);
            }
          });
        }}
      />
    </div>
  );
}
