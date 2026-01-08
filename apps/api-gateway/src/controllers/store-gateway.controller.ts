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

@Controller("stores")
export class StoreGatewayController {
  constructor(private readonly storeGatewayService: StoreGatewayService) {}

  @Post()
  async create(
    @Body() createStoreDto: CreateStoreDto,
    @Req() req: Request
  ): Promise<Store> {
    const token = req.cookies["access_token"];
    return this.storeGatewayService.create(createStoreDto, token);
  }

  @Get()
  async findAll(
    @Query("page") page: string = "1",
    @Req() req: Request,
    @Query("search") search?: string,
    @Query("limit") limit?: string
  ): Promise<PaginatedResult<Store>> {
    const token = req.cookies["access_token"];
    return this.storeGatewayService.findAll(
      +page,
      token,
      search,
      limit ? +limit : undefined
    );
  }

  @Delete(":id")
  async delete(@Param("id") id: string, @Req() req: Request): Promise<Store> {
    const token = req.cookies["access_token"];
    return this.storeGatewayService.delete(id, token);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @Req() req: Request
  ): Promise<Store> {
    const token = req.cookies["access_token"];
    return this.storeGatewayService.update(id, updateStoreDto, token);
  }
}
