import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GatewayModule } from "./modules/gateway.module";
import { StoreGatewayModule } from "./modules/store-gateway.module";
import { ProductGatewayModule } from "./modules/product-gateway.module";
import { UserGatewayModule } from "./modules/user-gateway.module";
import { StorageGatewayModule } from "./modules/storage-gateway.module";
import { SettingsModule } from "./modules/settings.module";
import { NewsletterModule } from "./modules/newsletter.module";
import { HttpModule } from "@nestjs/axios";

import { PassportModule } from "@nestjs/passport";

import { HealthController } from "./controllers/health.controller";
import { DeployController } from "./controllers/deploy.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GatewayModule,
    StoreGatewayModule,
    ProductGatewayModule,
    UserGatewayModule,
    StorageGatewayModule,
    SettingsModule,
    NewsletterModule,
    HttpModule,
    PassportModule,
  ],
  controllers: [HealthController, DeployController],
  providers: [],
})
export class AppModule {}
