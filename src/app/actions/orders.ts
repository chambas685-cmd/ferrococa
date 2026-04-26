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

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Lock-free check: re-read stock and validate inside transaction.
      const products = await tx.product.findMany({
        where: { id: { in: cart.items.map((i) => i.productId) }, active: true },
        select: { id: true, name: true, stock: true },
      });
      const stockMap = new Map(products.map((p) => [p.id, p]));

      for (const item of cart.items) {
        const p = stockMap.get(item.productId);
        if (!p) {
          throw new Error(`Producto no disponible: ${item.name}`);
        }
        if (p.stock < item.quantity) {
          throw new Error(
            `Solo quedan ${p.stock} unidad(es) de ${p.name} en stock`,
          );
        }
      }

      // Decrement stock atomically with a guard to prevent overselling.
      for (const item of cart.items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) {
          const name = stockMap.get(item.productId)?.name ?? "producto";
          throw new Error(`Stock insuficiente para ${name}`);
        }
      }

      return tx.order.create({
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
    });
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "No pudimos crear el pedido",
    };
  }

  await clearCart();
  revalidatePath("/admin/orders");
  revalidatePath("/products");
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
