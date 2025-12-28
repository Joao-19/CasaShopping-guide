import * as dotenv from "dotenv";
import { resolve } from "path";

// Force load local .env (apps/auth/.env) to override global/monorepo injections
dotenv.config({ path: resolve(__dirname, "../.env"), override: true });

import { NestFactory } from "@nestjs/core";
import { AuthModule } from "@/modules/auth.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  try {
    const app = await NestFactory.create(AuthModule);
    const configService = app.get(ConfigService);
    const port = process.env.PORT || 3003;
    const corsOrigin =
      configService.get<string>("CORS_ORIGIN") || "http://localhost:3000";

    console.log(`[AuthService] Starting on port: ${port}`);
    console.log(`[AuthService] Configured CORS Origin: ${corsOrigin}`);

    const origins = corsOrigin.includes(",")
      ? corsOrigin.split(",").map((origin) => origin.trim())
      : corsOrigin;

    app.enableCors({
      origin: origins,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    });

    await app.listen(port, "0.0.0.0");
    console.log(`🚀 Auth Service (NestJS) rodando na porta ${port}`);
  } catch (error) {
    console.error("❌ Error starting Auth Service:", error);
    process.exit(1);
  }
}
bootstrap();
