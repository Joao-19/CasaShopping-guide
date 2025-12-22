import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ProductController } from "../controllers/product.controller";
import { ProductService } from "@/services/product.service";
import { PassportModule } from "@nestjs/passport";
import { AuthGuardModule } from "@repo/auth-guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    AuthGuardModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
