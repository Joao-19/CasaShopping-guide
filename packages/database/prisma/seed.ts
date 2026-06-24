import { PrismaClient } from "../generated/client";
import { hash } from "bcryptjs"; // Você precisará instalar bcryptjs no packages/database
import process from "process";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@casashopping.com";

  // 1. Verifica se já existe
  const adminExists = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  // 2. Se não existir, cria
  if (!adminExists) {
    const hashedPassword = await hash("Mudar@123", 8); // Senha padrão inicial

    await prisma.admin.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });
    console.log("✅ Admin padrão criado com sucesso!");
  } else {
    console.log("ℹ️ Admin já existe, pulando criação.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
