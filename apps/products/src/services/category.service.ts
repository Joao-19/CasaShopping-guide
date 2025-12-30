import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { prisma } from "@repo/database";

@Injectable()
export class CategoryService implements OnModuleInit {
  private readonly logger = new Logger(CategoryService.name);

  async onModuleInit() {
    await this.seedCategories();
  }

  private async seedCategories() {
    const categories = [
      "Sala",
      "Quarto",
      "Banheiro",
      "Cozinha",
      "Área Externa",
      "Escritório",
    ];

    for (const name of categories) {
      const exists = await prisma.category.findUnique({
        where: { name },
      });

      if (!exists) {
        await prisma.category.create({
          data: { name },
        });
        this.logger.log(`Created category: ${name}`);
      }
    }
  }

  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  }
}
