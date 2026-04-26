import { prisma } from "@/lib/prisma";
import { UserRowActions } from "@/components/admin/UserRowActions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <h1 className="text-3xl font-black mb-6">Usuarios</h1>
      <div className="border border-black/10 rounded-lg bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-black/5 text-left">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Pedidos</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3 font-semibold">{u.fullName}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      u.role === "ADMIN"
                        ? "bg-[var(--color-brand)] text-black"
                        : "bg-black/10"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-3">{u._count.orders}</td>
                <td className="p-3 text-right">
                  <UserRowActions userId={u.id} role={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
