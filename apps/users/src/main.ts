import { NestFactory } from "@nestjs/core";
import { UserModule } from "@/modules/user.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 30000; // 30 seconds

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function bootstrap(retryCount = 0) {
  try {
    console.log(
      `[UsersService] Starting... (attempt ${retryCount + 1}/${MAX_RETRIES})`
    );

    const app = await NestFactory.create(UserModule);
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );
    const configService = app.get(ConfigService);

    const port = process.env.PORT || 3004;
    const corsOrigin =
      configService.get<string>("CORS_ORIGIN") || "http://localhost:3000";

    console.log(`[UsersService] Starting on port: ${port}`);
    console.log(`[UsersService] Configured CORS Origin: ${corsOrigin}`);

    const origins = corsOrigin.includes(",")
      ? corsOrigin.split(",").map((origin) => origin.trim())
      : corsOrigin;

    app.enableCors({
      origin: origins,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    });

    await app.listen(port, "0.0.0.0");
    console.log(`🚀 Users Service (NestJS) running on port ${port}`);
  } catch (error) {
    console.error(`❌ Error starting Users Service:`, error);

    if (retryCount < MAX_RETRIES - 1) {
      console.log(
        `⏳ Retrying in ${RETRY_DELAY_MS / 1000} seconds... (${retryCount + 1}/${MAX_RETRIES})`
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
