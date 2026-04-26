import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export default async function HomePage() {
  const featured = await prisma.product
    .findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    })
    .catch(() => []);

  return (
    <div>
      <section className="bg-[var(--color-brand)] text-black">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
              Ferretería FERROCOCA
            </h1>
            <p className="mt-4 text-lg max-w-prose">
              Herramientas, materiales eléctricos, plomería y más. Compra en
              línea, paga en efectivo o transferencia y coordina la entrega por
              WhatsApp.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="px-5 py-3 rounded bg-black text-white font-semibold hover:bg-black/80"
              >
                Ver productos
              </Link>
              <Link
                href="/register"
                className="px-5 py-3 rounded bg-white text-black font-semibold hover:bg-black/10"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
          <div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/local_ferrococa.png"
                alt="Ferretería FERROCOCA"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-bold">Productos destacados</h2>
          <Link
            href="/products"
            className="text-sm text-[var(--color-brand-dark)] font-semibold hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-black/60">
            Aún no hay productos publicados. Si eres administrador, ingresa al
            panel para empezar a publicar.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
