import "server-only";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const CART_COOKIE = "ferrococa_cart";

export type CartItem = { productId: string; quantity: number };

export async function readCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (i): i is CartItem =>
          !!i &&
          typeof (i as CartItem).productId === "string" &&
          typeof (i as CartItem).quantity === "number",
      )
      .filter((i) => i.quantity > 0);
  } catch {
    return [];
  }
}

export async function writeCart(items: CartItem[]) {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, encodeURIComponent(JSON.stringify(items)), {
    httpOnly: false, // accessible from client too
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCart() {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE);
}

export async function getCartWithProducts() {
  const items = await readCart();
  if (items.length === 0) return { items: [], total: 0 };

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, active: true },
  });
  const map = new Map(products.map((p) => [p.id, p]));

  const detailed = items
    .map((i) => {
      const p = map.get(i.productId);
      if (!p) return null;
      return {
        productId: p.id,
        name: p.name,
        unitPrice: Number(p.price),
        quantity: i.quantity,
        subtotal: Number(p.price) * i.quantity,
        imageUrl: p.imageUrl,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const total = detailed.reduce((acc, i) => acc + i.subtotal, 0);
  return { items: detailed, total };
}
