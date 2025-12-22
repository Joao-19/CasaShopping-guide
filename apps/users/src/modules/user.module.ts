import { Module } from "@nestjs/common";
import { UserController } from "@/controllers/user.controller";
import { UserService } from "@/services/user.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
