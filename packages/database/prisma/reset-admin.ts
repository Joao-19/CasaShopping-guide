import { PrismaClient } from "../generated/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const email = "admin@casashopping.com";
const password = "Admin@123";

async function main() {
  const hashed = await hash(password, 8);
  await prisma.admin.upsert({
    where: { email },
    update: { password: hashed, role: "SUPER_ADMIN", name: "Super Admin" },
    create: { email, password: hashed, role: "SUPER_ADMIN", name: "Super Admin" },
  });
  console.log(`Admin pronto: ${email} / ${password}`);
}

main().finally(() => prisma.$disconnect());
