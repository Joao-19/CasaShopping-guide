import { NestFactory } from "@nestjs/core";
import { ProductModule } from "@/modules/product.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  try {
    const app = await NestFactory.create(ProductModule);
    const configService = app.get(ConfigService);

    const port = process.env.PORT || 3006;
    const corsOrigin =
      configService.get<string>("CORS_ORIGIN") || "http://localhost:3000";

    console.log(`[ProductsService] Starting on port: ${port}`);
    console.log(`[ProductsService] Configured CORS Origin: ${corsOrigin}`);

    const origins = corsOrigin.includes(",")
      ? corsOrigin.split(",").map((origin) => origin.trim())
      : corsOrigin;

    app.enableCors({
      origin: origins,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    });

    await app.listen(port, "0.0.0.0");
    console.log(`🚀 Products Service (NestJS) rodando na porta ${port}`);
  } catch (error) {
    console.error("❌ Error starting Products Service:", error);
    process.exit(1);
  }
}
bootstrap();
