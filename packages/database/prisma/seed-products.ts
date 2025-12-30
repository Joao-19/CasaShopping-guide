import { PrismaClient } from "../generated/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Price tier type matching the Prisma enum
type PriceTier = "LOW" | "MEDIUM" | "HIGH";

interface ProductSeedData {
  name: string;
  description: string;
  category: string;
  price: string;
  tags: string;
}

async function seedProducts() {
  console.log("🚀 Iniciando seed de produtos...\n");

  // 1. Buscar todas as lojas disponíveis
  const stores = await prisma.store.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });

  if (stores.length === 0) {
    console.error(
      "❌ Nenhuma loja encontrada! Execute o seed de lojas primeiro."
    );
    return;
  }

  console.log(
    `📦 Encontradas ${stores.length} lojas para distribuir produtos.\n`
  );

  // 2. Carregar dados de produtos do JSON
  const dataPath = path.join(__dirname, "products-seed-data.json");
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const productsData: ProductSeedData[] = JSON.parse(rawData);

  console.log(`📋 ${productsData.length} produtos no arquivo de seed.\n`);

  // 3. Para cada produto, criar variações e distribuir entre lojas
  let createdCount = 0;
  const priceOptions: PriceTier[] = ["LOW", "MEDIUM", "HIGH"];

  for (let i = 0; i < productsData.length; i++) {
    const productData = productsData[i];

    // Distribuir entre lojas de forma aleatória
    const randomStore = stores[Math.floor(Math.random() * stores.length)];

    // Variação no preço para diversificar
    const priceIndex = Math.floor(Math.random() * priceOptions.length);
    const price = (productData.price as PriceTier) || priceOptions[priceIndex];

    // Variação no featured (10% de chance de ser destaque)
    const isFeatured = Math.random() < 0.15;

    try {
      await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          price: price,
          categories: [productData.category],
          tags: productData.tags,
          storeId: randomStore.id,
          showStorePhone: Math.random() < 0.7, // 70% mostram telefone
          isFeatured: isFeatured,
        },
      });

      createdCount++;
      console.log(
        `✅ [${createdCount}] ${productData.name} → ${randomStore.name}${isFeatured ? " ⭐" : ""}`
      );
    } catch (error: any) {
      console.error(`❌ Erro ao criar "${productData.name}": ${error.message}`);
    }
  }

  // 4. Criar mais variações duplicando produtos com sufixos
  const suffixes = [
    "Premium",
    "Luxo",
    "Compacto",
    "Clássico",
    "Moderno",
    "Plus",
  ];
  const additionalMultiplier = 3; // Criar 3x mais produtos

  console.log("\n🔄 Criando variações adicionais...\n");

  for (let round = 0; round < additionalMultiplier; round++) {
    for (let i = 0; i < productsData.length; i++) {
      const productData = productsData[i];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const randomStore = stores[Math.floor(Math.random() * stores.length)];
      const price =
        priceOptions[Math.floor(Math.random() * priceOptions.length)];
      const isFeatured = Math.random() < 0.1;

      try {
        await prisma.product.create({
          data: {
            name: `${productData.name} ${suffix}`,
            description: productData.description,
            price: price,
            categories: [productData.category],
            tags: productData.tags,
            storeId: randomStore.id,
            showStorePhone: Math.random() < 0.7,
            isFeatured: isFeatured,
          },
        });

        createdCount++;
        if (createdCount % 20 === 0) {
          console.log(`📊 ${createdCount} produtos criados...`);
        }
      } catch (error: any) {
        // Silenciar erros de duplicatas
      }
    }
  }

  console.log(
    `\n✨ Seed finalizado! ${createdCount} produtos criados no total.`
  );

  // Estatísticas por categoria
  const stats = await prisma.product.groupBy({
    by: ["categories"],
    _count: true,
  });

  console.log("\n📈 Distribuição por categoria:");
  // @ts-ignore
  stats.forEach((s) =>
    console.log(`   ${s.categories?.[0] || "N/A"}: ${s._count} produtos`)
  );

  const featuredCount = await prisma.product.count({
    where: { isFeatured: true },
  });
  console.log(`\n⭐ Produtos em destaque: ${featuredCount}`);
}

seedProducts()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
