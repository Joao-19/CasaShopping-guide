import { NestFactory } from "@nestjs/core";
import { UserModule } from "@/modules/user.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  try {
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

    await app.listen(port);

    console.log(`🚀 Users Service (NestJS) running on port ${port}`);
  } catch (error) {
    console.error("Failed to start Users Service:", error);
  }
}
bootstrap();
