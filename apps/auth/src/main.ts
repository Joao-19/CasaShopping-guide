import { NestFactory } from "@nestjs/core";
import { AuthModule } from "@/modules/auth.module";

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  app.enableCors();
  const port = process.env.PORT || 3003;
  await app.listen(port, "0.0.0.0");
  console.log(`🚀 Auth Service (NestJS) rodando na porta ${port}`);
}
bootstrap();
