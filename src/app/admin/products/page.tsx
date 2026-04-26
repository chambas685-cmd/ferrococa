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

      <details className="border border-black/10 rounded-lg bg-white p-4 mb-6">
        <summary className="font-bold cursor-pointer">+ Nuevo producto</summary>
        <div className="mt-4">
          <ProductFormCreate />
        </div>
      </details>

      <div className="border border-black/10 rounded-lg bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-black/5 text-left">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Estado</th>
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
              products.map((p) => (
                <tr key={p.id}>
                  <td className="p-3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-black/60 line-clamp-1">
                      {p.description}
                    </div>
                  </td>
                  <td className="p-3 font-bold">
                    {formatMoney(Number(p.price))}
                  </td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        p.active
                          ? "bg-green-100 text-green-800"
                          : "bg-black/10 text-black/60"
                      }`}
                    >
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <ProductRowActions
                      product={{
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        price: Number(p.price),
                        stock: p.stock,
                        imageUrl: p.imageUrl ?? "",
                        active: p.active,
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
