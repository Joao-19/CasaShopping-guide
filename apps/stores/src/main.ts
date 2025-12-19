import { NestFactory } from "@nestjs/core";
import { StoreModule } from "@/modules/store.module";

async function bootstrap() {
  const app = await NestFactory.create(StoreModule);
  app.enableCors();

  const port = process.env.PORT || 3005;
  await app.listen(port, "0.0.0.0");

  console.log(`🚀 Stores Service (NestJS) rodando na porta ${port}`);
}
bootstrap();
