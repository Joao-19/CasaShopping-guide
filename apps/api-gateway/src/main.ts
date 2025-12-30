import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./App.module";
import cookieParser from "cookie-parser";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 30000; // 30 seconds

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function bootstrap(retryCount = 0) {
  try {
    console.log(
      `[ApiGateway] Starting... (attempt ${retryCount + 1}/${MAX_RETRIES})`
    );

    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    const configService = app.get(ConfigService);

    const port = process.env.PORT || 3000;
    const corsOrigin =
      configService.get<string>("CORS_ORIGIN") ||
      "http://localhost:3001,http://localhost:3002";

    const origins = corsOrigin.includes(",")
      ? corsOrigin.split(",").map((origin) => origin.trim())
      : corsOrigin;

    console.log("CORS Origins Configured:", origins);

    app.enableCors({
      origin: origins,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    });

    await app.listen(port, "0.0.0.0");
    console.log(`🚀 API Gateway (NestJS) rodando na porta ${port}`);
  } catch (error) {
    console.error(`❌ Error starting API Gateway:`, error);

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
