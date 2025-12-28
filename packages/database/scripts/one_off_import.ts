import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, "stores_list.txt");

  if (!fs.existsSync(filePath)) {
    console.error("Arquivo stores_list.txt não encontrado!");
    return;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const lines = fileContent.split("\n").filter((line) => line.trim() !== "");

  console.log(`Encontradas ${lines.length} linhas para processar.`);

  for (const line of lines) {
    // Basic CSV parsing logic based on "Name, Address, Phone" format
    // Using simple split; handling potential commas in address requires regex if needed,
    // but assuming simple format provided by user:
    // "Breton, Bloco I, (21) 2108-8244"

    const parts = line.split(",").map((p) => p.trim());

    if (parts.length < 2) {
      console.warn(`Linha inválida (pulando): ${line}`);
      continue;
    }

    const name = parts[0];
    const address = parts[1]; // "Bloco I"
    const phone = parts.length > 2 ? parts[2] : null;

    try {
      await prisma.store.create({
        data: {
          name,
          address,
          phone,
        },
      });
      console.log(`✅ Adicionada: ${name}`);
    } catch (error) {
      console.error(`❌ Erro ao adicionar ${name}:`, error);
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
