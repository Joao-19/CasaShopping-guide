import { Controller, Post, Body } from "@nestjs/common";
import { UserService } from "@/services/user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  async register(@Body() data: any) {
    return this.userService.register(data);
  }
}
