"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import {
  adminResetPassword,
  adminToggleAdmin,
} from "@/app/actions/users";

export function UserRowActions({
  userId,
  role,
}: {
  userId: string;
  role: Role;
}) {
  const [pending, startTransition] = useTransition();
  const [showReset, setShowReset] = useState(false);
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
        onClick={() => {
          if (
            !confirm(
              role === "ADMIN"
                ? "¿Quitar privilegios de administrador?"
                : "¿Convertir en administrador?",
            )
          )
            return;
          startTransition(async () => {
            const r = await adminToggleAdmin(userId);
            if (r.error) setErr(r.error);
            else router.refresh();
          });
        }}
        className="text-sm font-semibold hover:underline"
      >
        {role === "ADMIN" ? "Quitar admin" : "Hacer admin"}
      </button>

      {err && <span className="text-xs text-red-700 w-full">{err}</span>}

      {showReset && (
        <div className="w-full mt-2 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="text"
            placeholder="Nueva contraseña (mín 6)"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            className="border border-black/15 rounded px-3 py-2 text-sm flex-1"
          />
          <button
            type="button"
            disabled={pending || newPwd.length < 6}
            onClick={() =>
              startTransition(async () => {
                setMsg(null);
                setErr(null);
                const r = await adminResetPassword(userId, newPwd);
                if (r.error) setErr(r.error);
                else {
                  setMsg("Contraseña actualizada. Comparte la nueva con el usuario.");
                  setNewPwd("");
                  setShowReset(false);
                }
              })
            }
            className="px-3 py-2 rounded bg-[var(--color-brand)] text-black font-bold text-sm disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      )}
      {msg && <span className="text-xs text-green-700 w-full">{msg}</span>}
    </div>
  );
}
