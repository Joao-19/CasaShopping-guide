import { NestFactory } from "@nestjs/core";
import { UserModule } from "@/modules/user.module";

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  app.enableCors();

  const port = process.env.PORT || 3004;
  await app.listen(port, "0.0.0.0");

  console.log(`🚀 Auth Service (NestJS) rodando na porta ${port}`);
}
bootstrap();
