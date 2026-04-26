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
      const quantity = Math.min(i.quantity, p.stock);
      const unitPrice = Number(p.discountPrice ?? p.price);
      return {
        productId: p.id,
        name: p.name,
        unitPrice,
        quantity,
        subtotal: unitPrice * quantity,
        imageUrl: p.imageUrl,
        stock: p.stock,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.quantity > 0);

  const total = detailed.reduce((acc, i) => acc + i.subtotal, 0);
  return { items: detailed, total };
}
