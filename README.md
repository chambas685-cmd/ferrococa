# FERROCOCA

Tienda web para la ferretería **FERROCOCA** construida con Next.js (App Router) + TypeScript + Tailwind + Prisma + PostgreSQL.

## Funcionalidades

- **Registro de usuarios por nombre + correo + contraseña**.
- **Inicio de sesión** con correo y contraseña, sesiones firmadas con (JWT en cookie HttpOnly).
- **Catálogo de productos** público con tarjetas, precios en USD y agregar al carrito.
- **Carrito persistido en cookie** (sin DB) con cantidades editables.
- **Checkout** con dirección de envío, método de pago (efectivo o transferencia) y notas.
- **Botón de WhatsApp en checkout** que abre `wa.me/<número>` con el mensaje del pedido pre-armado (cliente, productos, total, dirección, método de pago).
- **Panel admin** (`/admin`): resumen, gestión de **productos** (CRUD), **pedidos** (con cambio de estado) y **usuarios** (resetear contraseña, conmutar rol admin).
- Branding FERROCOCA: naranja (`#ff6a00`), blanco, negro.

## Instalación local

```bash
pnpm install
cp .env.example .env
# rellena DATABASE_URL, SESSION_SECRET, NEXT_PUBLIC_WHATSAPP_NUMBER, ADMIN_SEED_*
pnpm prisma db push
pnpm db:seed
pnpm dev
```

Luego abre <http://localhost:3000>.

## Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | sí | Conexión PostgreSQL. |
| `SESSION_SECRET` | sí | String aleatorio >= 32 chars para firmar JWT. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | sí | Número del admin (E.164 sin `+`). |
| `ADMIN_SEED_*` | no | Para crear el admin inicial al correr `pnpm db:seed`. |
| `SEED_DEMO_PRODUCTS` | no | `true` para insertar ~10 productos de ejemplo. |

## Estructura

- `src/app/` — rutas (Home, login, register, products, cart, checkout, orders/[id]/confirmation, admin/*).
- `src/app/actions/` — Server Actions (auth, products, cart, orders, users).
- `src/components/` — componentes UI (Header, ProductCard, CheckoutForm, etc).
- `src/lib/` — utilidades (`prisma`, `session`, `cart`, `whatsapp`, `format`).
- `prisma/schema.prisma` — modelos (User, Product, Order, OrderItem).
- `prisma/seed.ts` — siembra de admin y productos demo.

## Despliegue en Vercel

1. Crea una base de datos PostgreSQL (recomendado [Neon](https://neon.tech)).
2. Importa el repo en Vercel y configura las variables de entorno arriba.
3. En Neon, anota la `DATABASE_URL`. Ejecuta `pnpm prisma db push` localmente apuntando a esa DB para crear el esquema, y luego `pnpm db:seed` para crear el admin.
