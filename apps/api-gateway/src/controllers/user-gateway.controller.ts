import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
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

  @Delete(":id")
  async delete(@Param("id") id: string, @Req() req: Request): Promise<any> {
    const token = req.cookies["access_token"];
    return this.userGatewayService.delete(id, token);
  }
}
