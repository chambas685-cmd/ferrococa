import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";
import { ProductFormCreate } from "@/components/admin/ProductFormCreate";
import { ProductRowActions } from "@/components/admin/ProductRowActions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-black mb-6">Productos</h1>

      <details className="border border-black/10 rounded-xl bg-white p-4 sm:p-5 mb-6 group shadow-sm">
        <summary className="font-bold cursor-pointer flex items-center justify-between list-none">
          <span className="flex items-center gap-2">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-[var(--color-brand)] text-black text-lg font-black group-open:rotate-45 transition-transform">
              +
            </span>
            <span>Nuevo producto</span>
          </span>
          <span className="text-xs text-black/50 group-open:hidden">Click para abrir</span>
        </summary>
        <div className="mt-5">
          <ProductFormCreate />
        </div>
      </details>

      <div className="border border-black/10 rounded-xl bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-black/[.03] text-left">
            <tr>
              <th className="p-3 font-bold">Nombre</th>
              <th className="p-3 font-bold">Precio</th>
              <th className="p-3 font-bold">Stock</th>
              <th className="p-3 font-bold">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-black/60">
                  Sin productos. Crea el primero arriba.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const price = Number(p.price);
                const discount =
                  p.discountPrice != null ? Number(p.discountPrice) : null;
                const hasDiscount = discount !== null && discount < price;
                return (
                  <tr key={p.id} className="hover:bg-black/[.015] transition">
                    <td className="p-3">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-black/60 line-clamp-1">
                        {p.description}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {hasDiscount ? (
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs text-black/50 line-through">
                            {formatMoney(price)}
                          </span>
                          <span className="font-black text-[var(--color-brand-dark)]">
                            {formatMoney(discount as number)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold">{formatMoney(price)}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-semibold ${
                          p.stock <= 0
                            ? "text-red-700"
                            : p.stock <= 5
                              ? "text-[var(--color-brand-dark)]"
                              : ""
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          p.active
                            ? "bg-green-100 text-green-800"
                            : "bg-black/10 text-black/60"
                        }`}
                      >
                        {p.active ? "Activo" : "Oculto"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <ProductRowActions
                        product={{
                          id: p.id,
                          name: p.name,
                          description: p.description,
                          price,
                          discountPrice: discount,
                          stock: p.stock,
                          imageUrl: p.imageUrl ?? "",
                          active: p.active,
                        }}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
