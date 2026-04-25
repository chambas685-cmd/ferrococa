import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const adminName = process.env.ADMIN_SEED_NAME ?? "Administrador FERROCOCA";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "admin123";

  if (adminEmail) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN", fullName: adminName },
      create: {
        email: adminEmail,
        fullName: adminName,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`✓ Admin seed listo: ${adminEmail}`);
  } else {
    console.log("⚠ ADMIN_SEED_EMAIL no definido — saltando admin seed.");
  }

  const seedProducts = process.env.SEED_DEMO_PRODUCTS === "true";
  if (seedProducts) {
    const count = await prisma.product.count();
    if (count === 0) {
      await prisma.product.createMany({
        data: [
          {
            name: "Taladro Percutor 650W",
            description:
              "Taladro percutor de 650W, mandril de 13mm, ideal para hormigón y madera.",
            price: 65.0,
            stock: 12,
          },
          {
            name: "Martillo de uña 16oz",
            description:
              "Martillo de uña con mango de fibra de vidrio, 16oz, antideslizante.",
            price: 12.5,
            stock: 30,
          },
          {
            name: "Caja de clavos 2\" (1 lb)",
            description: "Clavos de acero de 2 pulgadas, libra (~150 unidades).",
            price: 3.25,
            stock: 100,
          },
          {
            name: "Destornillador set 6 piezas",
            description:
              "Set de 6 destornilladores planos y phillips con mango ergonómico.",
            price: 9.9,
            stock: 25,
          },
          {
            name: "Cinta métrica 5m",
            description: "Cinta métrica retráctil de 5 metros con freno.",
            price: 4.5,
            stock: 40,
          },
          {
            name: "Casco de seguridad",
            description: "Casco industrial naranja con suspensión ajustable.",
            price: 8.0,
            stock: 18,
          },
          {
            name: "Guantes de cuero (par)",
            description: "Guantes reforzados para construcción y ferretería.",
            price: 6.75,
            stock: 50,
          },
          {
            name: "Cable eléctrico 2x14 AWG (m)",
            description: "Cable dúplex 2x14 AWG por metro lineal.",
            price: 1.2,
            stock: 500,
          },
          {
            name: "Foco LED 9W",
            description: "Foco LED rosca E27, luz blanca cálida, 9W.",
            price: 2.5,
            stock: 80,
          },
          {
            name: "Cinta aislante 20m",
            description: "Cinta aislante negra para uso eléctrico, rollo de 20m.",
            price: 1.1,
            stock: 200,
          },
        ],
      });
      console.log("✓ Productos demo creados.");
    } else {
      console.log("⚠ Ya existen productos — saltando seed demo.");
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
