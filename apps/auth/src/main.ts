import * as dotenv from "dotenv";
import { resolve } from "path";

// Force load local .env (apps/auth/.env) to override global/monorepo injections
dotenv.config({ path: resolve(__dirname, "../.env"), override: true });

import { NestFactory } from "@nestjs/core";
import { AuthModule } from "@/modules/auth.module";
import { ConfigService } from "@nestjs/config";

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 30000; // 30 seconds

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function bootstrap(retryCount = 0) {
  try {
    console.log(
      `[AuthService] Starting... (attempt ${retryCount + 1}/${MAX_RETRIES})`,
    );

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

    const jwtSecret =
      configService.get<string>("JWT_SECRET") || "changeme_secret";
    console.log(
      `[AuthService] Using JWT_SECRET: ${jwtSecret.slice(0, 3)}... (Length: ${jwtSecret.length})`,
    );

    await app.listen(port, "0.0.0.0");
    console.log(`🚀 Auth Service (NestJS) rodando na porta ${port}`);
  } catch (error) {
    console.error(`❌ Error starting Auth Service:`, error);

    if (retryCount < MAX_RETRIES - 1) {
      console.log(
        `⏳ Retrying in ${RETRY_DELAY_MS / 1000} seconds... (${retryCount + 1}/${MAX_RETRIES})`,
      );
      await sleep(RETRY_DELAY_MS);
      return bootstrap(retryCount + 1);
    } else {
      console.error(`💀 Max retries reached. Exiting.`);
      process.exit(1);
    }
  }
}
bootstrap();
