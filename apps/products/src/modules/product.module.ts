import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ProductController } from "../controllers/product.controller";
import { CategoryController } from "../controllers/category.controller";
import { ProductService } from "@/services/product.service";
import { CategoryService } from "@/services/category.service";
import { PassportModule } from "@nestjs/passport";
import { AuthGuardModule } from "@repo/auth-guard";

import { HealthController } from "../controllers/health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    AuthGuardModule,
  ],
  controllers: [ProductController, CategoryController, HealthController],
  providers: [ProductService, CategoryService],
})
export class ProductModule {}
