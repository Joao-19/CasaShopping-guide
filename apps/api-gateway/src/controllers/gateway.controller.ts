import { Controller, Post, Body } from "@nestjs/common";
import { GatewayService } from "../services/gateway.service";
import { CreateUserDto } from "@repo/dtos";

@Controller("auth")
export class AuthController {
  constructor(private readonly gatewayService: GatewayService) {
    console.log(
      "AuthController initialized. GatewayService is:",
      gatewayService
    );
  }

  @Post("register")
  async register(@Body() data: CreateUserDto) {
    const user = await this.gatewayService.register(data);
    return user;
  }
}
