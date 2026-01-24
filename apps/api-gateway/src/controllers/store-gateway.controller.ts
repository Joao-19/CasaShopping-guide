import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
  Put,
  Req,
} from "@nestjs/common";
import { StoreGatewayService } from "../services/store-gateway.service";
import {
  CreateStoreDto,
  UpdateStoreDto,
  Store,
  PaginatedResult,
} from "@repo/dtos";
import { Request } from "express";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";

@ApiTags("Stores")
@Controller("stores")
export class StoreGatewayController {
  constructor(private readonly storeGatewayService: StoreGatewayService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new store" })
  @ApiResponse({
    status: 201,
    description: "The store has been successfully created.",
  })
  async create(
    @Body() createStoreDto: CreateStoreDto,
    @Req() req: Request,
  ): Promise<Store> {
    const token = req.cookies["access_token"];
    return this.storeGatewayService.create(createStoreDto, token);
  }

  @Get()
  @ApiOperation({ summary: "Retrieve all stores with pagination and search" })
  @ApiResponse({ status: 200, description: "Return paginated stores." })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "limit", required: false })
  async findAll(
    @Query("page") page: string = "1",
    @Req() req: Request,
    @Query("search") search?: string,
    @Query("limit") limit?: string,
  ): Promise<PaginatedResult<Store>> {
    const token = req.cookies["access_token"];
    return this.storeGatewayService.findAll(
      +page,
      token,
      search,
      limit ? +limit : undefined,
    );
  }

  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a store" })
  @ApiResponse({
    status: 200,
    description: "The store has been successfully deleted.",
  })
  async delete(@Param("id") id: string, @Req() req: Request): Promise<Store> {
    const token = req.cookies["access_token"];
    return this.storeGatewayService.delete(id, token);
  }

  @Put(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a store" })
  @ApiResponse({
    status: 200,
    description: "The store has been successfully updated.",
  })
  async update(
    @Param("id") id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @Req() req: Request,
  ): Promise<Store> {
    const token = req.cookies["access_token"];
    return this.storeGatewayService.update(id, updateStoreDto, token);
  }
}
