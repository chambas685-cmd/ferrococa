"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { readCart, writeCart } from "@/lib/cart";

export type CartActionResult = { ok: true } | { error: string };

export async function addToCart(
  productId: string,
  quantity = 1,
): Promise<CartActionResult> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true, active: true, name: true },
  });
  if (!product || !product.active) {
    return { error: "Producto no disponible" };
  }
  if (product.stock <= 0) {
    return { error: `${product.name} está agotado` };
  }

  const items = await readCart();
  const existing = items.find((i) => i.productId === productId);
  const desired = (existing?.quantity ?? 0) + quantity;
  const finalQty = Math.min(desired, product.stock);

  if (existing) {
    existing.quantity = finalQty;
  } else {
    items.push({ productId, quantity: finalQty });
  }
  await writeCart(items);
  revalidatePath("/cart");
  revalidatePath("/products");
  revalidatePath("/checkout");

  if (desired > product.stock) {
    return {
      error: `Solo quedan ${product.stock} unidad(es) de ${product.name} en stock`,
    };
  }
  return { ok: true };
}

export async function setCartQuantity(
  productId: string,
  quantity: number,
): Promise<CartActionResult> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true, active: true, name: true },
  });
  if (!product || !product.active) {
    return { error: "Producto no disponible" };
  }

  const clamped = Math.min(Math.max(0, quantity), product.stock);
  const items = await readCart();
  const next = items
    .map((i) => (i.productId === productId ? { ...i, quantity: clamped } : i))
    .filter((i) => i.quantity > 0);
  await writeCart(next);
  revalidatePath("/cart");
  revalidatePath("/checkout");

  if (quantity > product.stock) {
    return {
      error: `Solo quedan ${product.stock} unidad(es) de ${product.name}`,
    };
  }
  return { ok: true };
}

export async function removeFromCart(productId: string) {
  const items = await readCart();
  await writeCart(items.filter((i) => i.productId !== productId));
  revalidatePath("/cart");
  revalidatePath("/checkout");
}
