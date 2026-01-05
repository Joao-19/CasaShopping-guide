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
  Res,
} from "@nestjs/common";
import { UserGatewayService } from "../services/user-gateway.service";
import { CreateUserDto, PaginatedResult } from "@repo/dtos";
import { Request, Response } from "express";

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

  @Get("export")
  async export(@Req() req: Request, @Res() res: Response): Promise<any> {
    const token = req.cookies["access_token"];
    const stream = await this.userGatewayService.export(token);

    res.set({
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="usuarios-${new Date().toISOString().split("T")[0]}.csv"`,
    });

    stream.pipe(res);
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
