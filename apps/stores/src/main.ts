import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { StoreModule } from "@/modules/store.module";
import { ConfigService } from "@nestjs/config";

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 30000; // 30 seconds

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function bootstrap(retryCount = 0) {
  try {
    console.log(
      `[StoresService] Starting... (attempt ${retryCount + 1}/${MAX_RETRIES})`,
    );

    const app = await NestFactory.create(StoreModule);
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    const configService = app.get(ConfigService);

    const port = process.env.PORT || 3005;
    const corsOrigin =
      configService.get<string>("CORS_ORIGIN") || "http://localhost:3000";

    console.log(`[StoresService] Starting on port: ${port}`);
    console.log(`[StoresService] Configured CORS Origin: ${corsOrigin}`);

    const origins = corsOrigin.includes(",")
      ? corsOrigin.split(",").map((origin) => origin.trim())
      : [corsOrigin];

    app.enableCors({
      origin: (requestOrigin: any, callback: any) => {
        if (!requestOrigin || origins.includes(requestOrigin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    });

    await app.listen(port, "0.0.0.0");
    console.log(`🚀 Stores Service (NestJS) rodando na porta ${port}`);
  } catch (error) {
    console.error(`❌ Error starting Stores Service:`, error);

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
