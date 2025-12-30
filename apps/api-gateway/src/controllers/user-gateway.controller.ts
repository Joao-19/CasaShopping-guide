import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Patch,
  Param,
  Req,
} from "@nestjs/common";
import { UserGatewayService } from "../services/user-gateway.service";
import { CreateUserDto, PaginatedResult } from "@repo/dtos";
import { Request } from "express";

@Controller("users")
export class UserGatewayController {
  constructor(private readonly userGatewayService: UserGatewayService) {}

  @Post()
  async create(@Body() createUserDto: any, @Req() req: Request): Promise<any> {
    const token = req.cookies["access_token"];
    return this.userGatewayService.create(createUserDto, token);
  }

  @Get()
  async findAll(
    @Query("page") page: string = "1",
    @Req() req: Request,
    @Query("search") search?: string
  ): Promise<PaginatedResult<any>> {
    const token = req.cookies["access_token"];
    return this.userGatewayService.findAll(+page, token, search);
  }

  @Get("me")
  async getMe(@Req() req: Request): Promise<any> {
    const token = req.cookies["access_token"];
    return this.userGatewayService.getMe(token);
  }

  @Patch("me/profile-image")
  async updateProfileImage(
    @Body() body: { profileImage: string },
    @Req() req: Request
  ): Promise<any> {
    const token = req.cookies["access_token"];
    return this.userGatewayService.updateProfileImage(body.profileImage, token);
  }

  @Delete("me")
  async deleteMe(@Req() req: Request): Promise<any> {
    const token = req.cookies["access_token"];
    return this.userGatewayService.deleteMe(token);
  }

  @Delete(":id")
  async delete(@Param("id") id: string, @Req() req: Request): Promise<any> {
    const token = req.cookies["access_token"];
    return this.userGatewayService.delete(id, token);
  }
}
