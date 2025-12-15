import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "@/services/auth.service";
import { CreateUserDto } from "@repo/dtos";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() data: CreateUserDto) {
    const user = await this.authService.register(data);
    return user;
  }
}
