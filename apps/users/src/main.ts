import { NestFactory } from "@nestjs/core";
import { UserModule } from "@/modules/user.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  const configService = app.get(ConfigService);

  const port = process.env.PORT || 3004;
  const corsOrigin =
    configService.get<string>("CORS_ORIGIN") || "http://localhost:3000";

  const origins = corsOrigin.includes(",")
    ? corsOrigin.split(",").map((origin) => origin.trim())
    : corsOrigin;

  app.enableCors({
    origin: origins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  console.log(`🚀 Auth Service (NestJS) rodando na porta ${port}`);
}
bootstrap();
