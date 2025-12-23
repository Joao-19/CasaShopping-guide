import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
} from "@nestjs/common";
import { UserService } from "@/services/user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  async register(@Body() data: any) {
    return this.userService.register(data);
  }

  @Get()
  async findAll(
    @Query("page") page: string = "1",
    @Query("search") search?: string
  ) {
    return this.userService.findAll(+page, search);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.userService.delete(id);
  }
}
