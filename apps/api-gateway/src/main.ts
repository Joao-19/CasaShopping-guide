import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./App.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);

  const port = process.env.PORT || 3000;
  const corsOrigin =
    configService.get<string>("CORS_ORIGIN") || "http://localhost:3001";

  app.enableCors({
    origin: corsOrigin,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  await app.listen(port);
  console.log(`🚀 Auth Service (NestJS) rodando na porta ${port}`);
}
bootstrap();
