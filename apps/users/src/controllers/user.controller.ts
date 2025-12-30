import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Patch,
  Param,
  Headers,
  UnauthorizedException,
} from "@nestjs/common";
import { UserService } from "@/services/user.service";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}

  private getUserIdFromToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token not provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const secret = this.configService.getOrThrow<string>("JWT_SECRET");

    try {
      const decoded = jwt.verify(token, secret) as any;
      const userId = decoded.sub || decoded.id;

      if (!userId) {
        throw new UnauthorizedException("Invalid token: no user ID");
      }

      return userId;
    } catch (error: any) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        throw new UnauthorizedException("Invalid or expired token");
      }
      throw error;
    }
  }

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

  @Get("me")
  async getMe(@Headers("authorization") authHeader: string) {
    const userId = this.getUserIdFromToken(authHeader);
    return this.userService.getById(userId);
  }

  @Patch("me/profile-image")
  async updateProfileImage(
    @Headers("authorization") authHeader: string,
    @Body() body: { profileImage: string }
  ) {
    const userId = this.getUserIdFromToken(authHeader);
    return this.userService.updateProfileImage(userId, body.profileImage);
  }

  @Delete("me")
  async deleteMe(@Headers("authorization") authHeader: string) {
    const userId = this.getUserIdFromToken(authHeader);
    return this.userService.delete(userId);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.userService.delete(id);
  }
}
