import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GatewayModule } from "./modules/gateway.module";
import { HttpModule } from "@nestjs/axios";
import { PassportModule } from "@nestjs/passport";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GatewayModule,
    HttpModule,
    PassportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
