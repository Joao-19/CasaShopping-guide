import { Controller, Post, Body, ConflictException } from "@nestjs/common";
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

  @Post("login")
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new ConflictException("Credenciais inválidas");
    }
    return this.authService.login(user);
  }

  @Post("admin/login")
  async loginAdmin(@Body() body: any) {
    const admin = await this.authService.validateAdmin(
      body.email,
      body.password
    );
    if (!admin) {
      throw new ConflictException("Credenciais de administrador inválidas");
    }
    return this.authService.loginAdmin(admin);
  }
}
