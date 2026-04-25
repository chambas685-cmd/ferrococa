"use server";

import { revalidatePath } from "next/cache";
import { readCart, writeCart } from "@/lib/cart";

export async function addToCart(productId: string, quantity = 1) {
  const items = await readCart();
  const existing = items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }
  await writeCart(items);
  revalidatePath("/cart");
  revalidatePath("/products");
  revalidatePath("/checkout");
}

export async function setCartQuantity(productId: string, quantity: number) {
  const items = await readCart();
  const next = items
    .map((i) => (i.productId === productId ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0);
  await writeCart(next);
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function removeFromCart(productId: string) {
  const items = await readCart();
  await writeCart(items.filter((i) => i.productId !== productId));
  revalidatePath("/cart");
  revalidatePath("/checkout");
}
