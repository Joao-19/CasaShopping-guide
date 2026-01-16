import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  ConflictException,
} from "@nestjs/common";
import { Response, Request } from "express";
import { GatewayService } from "../services/gateway.service";
import { CreateUserDto } from "@repo/dtos";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  async register(@Body() data: CreateUserDto) {
    const user = await this.gatewayService.register(data);
    return user;
  }

  @Post("login")
  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 200, description: "Login successful" })
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

    return { ...user, accessToken, refreshToken };
  }

  @Post("admin/login")
  @ApiOperation({ summary: "Admin login" })
  @ApiResponse({ status: 200, description: "Admin login successful" })
  async loginAdmin(
    @Body() body: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken, user } =
      await this.gatewayService.adminLogin(body);

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

    return { ...user, accessToken, refreshToken };
  }

  @Post("logout")
  @ApiOperation({ summary: "Logout user" })
  @ApiResponse({ status: 200, description: "Logged out successfully" })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return { message: "Logged out successfully" };
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({ status: 409, description: "Refresh token not found" })
  async refresh(
    @Req() req: Request,
    @Body() body: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshTokenCookie = (req as any).cookies["refresh_token"];
    const refreshTokenBody = body?.refreshToken;

    const tokenToUse = refreshTokenCookie || refreshTokenBody;

    if (!tokenToUse) {
      throw new ConflictException("Refresh token não encontrado");
    }

    try {
      const { accessToken, refreshToken, user } =
        await this.gatewayService.refreshToken(tokenToUse);

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

      return { ...user, accessToken, refreshToken };
    } catch (error) {
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");
      throw error;
    }
  }
}
