import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GatewayModule } from "./modules/gateway.module";
import { StoreGatewayModule } from "./modules/store-gateway.module";
import { ProductGatewayModule } from "./modules/product-gateway.module";
import { HttpModule } from "@nestjs/axios";

import { PassportModule } from "@nestjs/passport";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GatewayModule,
    StoreGatewayModule,
    ProductGatewayModule,
    HttpModule,
    PassportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
