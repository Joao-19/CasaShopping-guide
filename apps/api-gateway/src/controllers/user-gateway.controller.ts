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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";

@ApiTags("Users")
@Controller("users")
export class UserGatewayController {
  constructor(private readonly userGatewayService: UserGatewayService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User created successfully." })
  async create(@Body() createUserDto: any, @Req() req: Request): Promise<any> {
    const token = req.cookies["access_token"];
    return this.userGatewayService.create(createUserDto, token);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all users with pagination" })
  @ApiResponse({ status: 200, description: "Return paginated list of users." })
  @ApiQuery({ name: "page", required: false, description: "Page number" })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Search term for user",
  })
  async findAll(
    @Query("page") page: string = "1",
    @Req() req: Request,
    @Query("search") search?: string
  ): Promise<PaginatedResult<any>> {
    const token = req.cookies["access_token"];
    return this.userGatewayService.findAll(+page, token, search);
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "Return current user profile." })
  async getMe(@Req() req: Request): Promise<any> {
    const token = req.cookies["access_token"];
    return this.userGatewayService.getMe(token);
  }

  @Patch("me/profile-image")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update profile image" })
  @ApiResponse({ status: 200, description: "Profile image updated." })
  async updateProfileImage(
    @Body() body: { profileImage: string },
    @Req() req: Request
  ): Promise<any> {
    const token = req.cookies["access_token"];
    return this.userGatewayService.updateProfileImage(body.profileImage, token);
  }

  @Get("export")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Export users to CSV" })
  @ApiResponse({ status: 200, description: "CSV file download." })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete current user account" })
  @ApiResponse({ status: 200, description: "User account deleted." })
  async deleteMe(@Req() req: Request): Promise<any> {
    const token = req.cookies["access_token"];
    return this.userGatewayService.deleteMe(token);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a user by ID" })
  @ApiResponse({ status: 200, description: "User deleted." })
  async delete(@Param("id") id: string, @Req() req: Request): Promise<any> {
    const token = req.cookies["access_token"];
    return this.userGatewayService.delete(id, token);
  }
}
