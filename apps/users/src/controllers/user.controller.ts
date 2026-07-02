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
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { UserService } from "@/services/user.service";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";
import { UpdateProfileImageDto } from "@repo/dtos";
import {
  HttpException,
  HttpStatus,
  UseGuards,
  Request as Req,
} from "@nestjs/common";
import { JwtAuthGuard, Roles, RolesGuard } from "@repo/auth-guard";

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
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

  async register(@Body() data: any) {
    return this.userService.register(data);
  }

  @Get("export")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async export(@Res() res: Response) {
    const stream = this.userService.exportUsers();

    res.set({
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="users-${new Date().toISOString().split("T")[0]}.csv"`,
    });

    for await (const chunk of stream) {
      res.write(chunk);
    }

    res.end();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async findAll(
    @Query("page") page: string = "1",
    @Query("search") search?: string,
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
    @Body() body: UpdateProfileImageDto,
  ) {
    try {
      const userId = this.getUserIdFromToken(authHeader);
      return await this.userService.updateProfileImage(
        userId,
        body.profileImage,
      );
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error.code === "P2025") {
        throw new HttpException(
          "User not found (Token mismatch)",
          HttpStatus.CONFLICT,
        );
      }
      console.error("[UserController] Error updating profile image:", error);
      throw new HttpException(
        error.message || "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch("me/privacy")
  async acceptPrivacy(@Headers("authorization") authHeader: string) {
    const userId = this.getUserIdFromToken(authHeader);
    return this.userService.acceptPrivacy(userId);
  }

  @Delete("me")
  async deleteMe(@Headers("authorization") authHeader: string) {
    const userId = this.getUserIdFromToken(authHeader);
    return this.userService.delete(userId);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async delete(@Param("id") id: string) {
    return this.userService.delete(id);
  }
}
