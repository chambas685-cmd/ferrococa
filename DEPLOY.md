# Despliegue de FERROCOCA

Proyecto Next.js 16 + Prisma + PostgreSQL. Abajo están los pasos para correrlo local y desplegarlo en Vercel + Neon (gratis).

## 1. Requisitos

- Node.js 20+
- pnpm 9+ (`npm i -g pnpm`)
- PostgreSQL (local con Docker, o cuenta gratis en [Neon](https://neon.tech) / [Supabase](https://supabase.com))

## 2. Correr en local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus datos (ver sección "Variables" abajo)

# 3. Crear tablas y admin inicial
pnpm prisma db push
pnpm db:seed

# 4. Levantar el server
pnpm dev
# → http://localhost:3000
```

Accede al panel admin con el correo y contraseña que pusiste en `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`.

## 3. Variables de entorno

Copia `.env.example` y llena:

| Variable | Requerida | Ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | sí | `postgresql://usuario:clave@host:5432/ferrococa?sslmode=require` |
| `SESSION_SECRET` | sí | String aleatorio ≥ 32 chars. Genera con `openssl rand -base64 48` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | sí | `593987654321` (E.164 sin `+`) |
| `ADMIN_SEED_EMAIL` | recomendado | `tu@correo.com` |
| `ADMIN_SEED_NAME` | recomendado | `Tu Nombre` |
| `ADMIN_SEED_PASSWORD` | recomendado | Una clave inicial (cámbiala después) |
| `SEED_DEMO_PRODUCTS` | no | `true` para crear 10 productos demo |

## 4. Desplegar en Vercel + Neon

### 4a. Crear la base de datos en Neon
1. Ir a https://neon.tech y crear proyecto `ferrococa`.
2. Copiar el **connection string** (debe terminar en `?sslmode=require`).

### 4b. Subir el código a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
# Crear repo vacío en github.com/new llamado ferrococa
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ferrococa.git
git push -u origin main
```

### 4c. Crear el proyecto en Vercel
1. Ir a https://vercel.com/new e importar el repo `ferrococa`.
2. Framework: **Next.js** (detectado automáticamente).
3. En **Environment Variables** agregar:
   - `DATABASE_URL` = connection string de Neon
   - `SESSION_SECRET` = `openssl rand -base64 48`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` = tu número
   - `ADMIN_SEED_EMAIL` / `ADMIN_SEED_NAME` / `ADMIN_SEED_PASSWORD`
   - `SEED_DEMO_PRODUCTS` = `true` (opcional)
4. En **Build & Development Settings**, cambia el **Build Command** a:
   ```
   pnpm prisma db push && pnpm db:seed && pnpm build
   ```
   (Esto crea las tablas, siembra el admin/productos, y luego hace build. Después puedes volver a `pnpm build` para despliegues siguientes.)
5. **Deploy**.

### 4d. Primer login
Visita tu URL de Vercel → `/login` → entra con `ADMIN_SEED_EMAIL` + `ADMIN_SEED_PASSWORD`.
Cambia la contraseña inmediatamente desde el panel admin.

### 4e. Despliegues siguientes
Una vez creado el admin y los productos iniciales, cambia el Build Command a:
```
pnpm prisma db push && pnpm build
```
(Quita el `db:seed` para no re-crear productos demo.)

## 5. Estructura del proyecto

- `src/app/` — rutas (home, login, register, products, cart, checkout, admin)
- `src/app/actions/` — Server Actions (auth, products, cart, orders, users)
- `src/components/` — UI (Header, CheckoutForm, RegisterForm, etc.)
- `src/lib/` — utilidades (`prisma`, `session`, `cart`, `whatsapp`, `format`)
- `prisma/schema.prisma` — modelos (User, Product, Order, OrderItem)
- `prisma/seed.ts` — siembra de admin y productos demo

## 6. Flujo de compra

1. Usuario se registra con nombre + correo + contraseña.
2. Agrega productos al carrito.
3. En `/checkout` ingresa dirección, método de pago (efectivo/transferencia) y notas.
4. Al confirmar se crea el pedido en la base y se redirige a la confirmación.
5. En la confirmación se abre automáticamente `wa.me/<NEXT_PUBLIC_WHATSAPP_NUMBER>` con el mensaje pre-armado:
   ```
   *FERROCOCA — Nuevo pedido*
   Pedido #ABCDEF
   *Cliente:* Juan Pérez
   *Correo:* juan@correo.com
   *Productos:*
   • 2 x Taladro 650W — $65.00 c/u = $130.00
   *Total:* $130.00
   *Método de pago:* Efectivo
   *Dirección de envío:* Av. Amazonas 123
   ```

## 7. Panel admin

Ruta `/admin`. Solo accesible para usuarios con rol `ADMIN`.
- **Productos**: crear, editar, activar/desactivar, actualizar stock.
- **Pedidos**: ver todos, cambiar estado (PENDIENTE → PAGADO → ENVIADO → COMPLETADO / CANCELADO), reenviar WhatsApp.
- **Usuarios**: ver todos, resetear contraseña, promover/degradar rol.
