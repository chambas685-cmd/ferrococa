"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/session";
import { clearCart, getCartWithProducts } from "@/lib/cart";
import type { OrderStatus } from "@prisma/client";

const CheckoutSchema = z.object({
  paymentMethod: z.enum(["CASH", "TRANSFER"]),
  address: z.string().min(5, "Ingresa tu dirección de envío"),
  notes: z.string().max(500).optional(),
});

export type CheckoutState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login?next=/checkout");
  }

  const parsed = CheckoutSchema.safeParse({
    paymentMethod: formData.get("paymentMethod"),
    address: formData.get("address"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return {
      error: "Revisa los datos del checkout",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const cart = await getCartWithProducts();
  if (cart.items.length === 0) {
    return { error: "Tu carrito está vacío" };
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      total: cart.total,
      paymentMethod: parsed.data.paymentMethod,
      address: parsed.data.address,
      notes: parsed.data.notes,
      status: "PENDING",
      items: {
        create: cart.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
        })),
      },
    },
  });

  await clearCart();
  revalidatePath("/admin/orders");
  redirect(`/orders/${order.id}/confirmation`);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
