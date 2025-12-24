import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { StorageGatewayController } from "../controllers/storage-gateway.controller";
import { StorageGatewayService } from "../services/storage-gateway.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [StorageGatewayController],
  providers: [StorageGatewayService],
  exports: [StorageGatewayService],
})
export class StorageGatewayModule {}
