"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function adminResetPassword(userId: string, newPassword: string) {
  await requireAdmin();
  const parsed = z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .safeParse(newPassword);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Contraseña inválida" };
  }
  const passwordHash = await bcrypt.hash(parsed.data, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function adminToggleAdmin(userId: string) {
  const me = await requireAdmin();
  if (me.id === userId) {
    return { error: "No puedes cambiar tu propio rol" };
  }
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) return { error: "Usuario no encontrado" };
  await prisma.user.update({
    where: { id: userId },
    data: { role: u.role === "ADMIN" ? "USER" : "ADMIN" },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function adminUpdateUser(
  userId: string,
  data: { fullName?: string; email?: string },
) {
  await requireAdmin();
  const parsed = z
    .object({
      fullName: z.string().min(3).optional(),
      email: z.email().optional(),
    })
    .safeParse(data);
  if (!parsed.success) return { error: "Datos inválidos" };
  await prisma.user.update({ where: { id: userId }, data: parsed.data });
  revalidatePath("/admin/users");
  return { ok: true };
}
