import { NestFactory } from "@nestjs/core";
import { AuthModule } from "@/modules/gateway.module";

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const port = process.env.PORT || 3000;
  app.enableCors();
  await app.listen(port);
  console.log(`🚀 Auth Service (NestJS) rodando na porta ${port}`);
}
bootstrap();
