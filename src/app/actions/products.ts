"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const ProductSchema = z
  .object({
    name: z.string().min(2, "Nombre demasiado corto"),
    description: z.string().min(2, "Descripción demasiado corta"),
    price: z.coerce.number().positive("El precio debe ser mayor a 0"),
    discountPrice: z
      .union([z.literal(""), z.coerce.number().positive()])
      .optional(),
    stock: z.coerce.number().int().min(0, "Stock inválido"),
    imageUrl: z.string().url().optional().or(z.literal("")),
  })
  .refine(
    (d) =>
      d.discountPrice === "" ||
      d.discountPrice === undefined ||
      d.discountPrice < d.price,
    {
      message: "El descuento debe ser menor que el precio",
      path: ["discountPrice"],
    },
  );

export type ProductActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  ok?: boolean;
};

export async function createProduct(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();
  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    discountPrice: formData.get("discountPrice") ?? "",
    stock: formData.get("stock"),
    imageUrl: formData.get("imageUrl") ?? "",
  });
  if (!parsed.success) {
    return {
      error: "Revisa los datos",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }
  const data = parsed.data;
  await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      discountPrice:
        typeof data.discountPrice === "number" ? data.discountPrice : null,
      stock: data.stock,
      imageUrl: data.imageUrl ? data.imageUrl : null,
      active: true,
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true };
}

export async function updateProduct(
  id: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();
  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    discountPrice: formData.get("discountPrice") ?? "",
    stock: formData.get("stock"),
    imageUrl: formData.get("imageUrl") ?? "",
  });
  if (!parsed.success) {
    return {
      error: "Revisa los datos",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }
  const data = parsed.data;
  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      discountPrice:
        typeof data.discountPrice === "number" ? data.discountPrice : null,
      stock: data.stock,
      imageUrl: data.imageUrl ? data.imageUrl : null,
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true };
}

export async function toggleProductActive(id: string) {
  await requireAdmin();
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return;
  await prisma.product.update({
    where: { id },
    data: { active: !p.active },
  });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  // Marcamos como inactivo si tiene pedidos para preservar historial.
  const itemsCount = await prisma.orderItem.count({ where: { productId: id } });
  if (itemsCount > 0) {
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });
  } else {
    await prisma.product.delete({ where: { id } });
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
}
