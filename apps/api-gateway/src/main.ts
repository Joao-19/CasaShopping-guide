import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./App.module";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.use(cookieParser());
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
  console.log(`🚀 Auth Service (NestJS) rodando na porta ${port}`);
}
bootstrap();
