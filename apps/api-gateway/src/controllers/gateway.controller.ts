import { Controller, Post, Body, Res } from "@nestjs/common";
import { Response } from "express";
import { GatewayService } from "../services/gateway.service";
import { CreateUserDto } from "@repo/dtos";

@Controller("auth")
export class AuthController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post("register")
  async register(@Body() data: CreateUserDto) {
    const user = await this.gatewayService.register(data);
    return user;
  }

  @Post("login")
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } =
      await this.gatewayService.login(body);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return user;
  }
}
