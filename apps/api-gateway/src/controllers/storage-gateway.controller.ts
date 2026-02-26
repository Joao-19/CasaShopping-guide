import { Controller, Post, Body, Req } from "@nestjs/common";
import { StorageGatewayService } from "../services/storage-gateway.service";
import { Request } from "express";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from "@nestjs/swagger";

@ApiTags("Storage")
@Controller("storage")
export class StorageGatewayController {
  constructor(private readonly storageGatewayService: StorageGatewayService) {}

  @Post("upload-url")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get presigned URL for file upload" })
  @ApiResponse({ status: 201, description: "Presigned URL returned." })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        storeId: { type: "string" },
        folder: { type: "string" },
        filename: { type: "string" },
        contentType: { type: "string" },
        contentLength: { type: "number" },
      },
    },
  })
  async getUploadUrl(
    @Body()
    body: {
      storeId?: string;
      folder?: string;
      filename: string;
      contentType: string;
      contentLength: number;
    },
    @Req() req: Request,
  ) {
    const token =
      req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];
    return this.storageGatewayService.getUploadUrl(
      body.storeId,
      body.filename,
      body.contentType,
      body.contentLength,
      token || "",
      body.folder,
    );
  }

  @Post("delete")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a file from storage" })
  @ApiResponse({ status: 200, description: "File deleted." })
  @ApiBody({
    schema: { type: "object", properties: { key: { type: "string" } } },
  })
  async deleteFile(@Body() body: { key: string }, @Req() req: Request) {
    const token =
      req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];
    return this.storageGatewayService.deleteFile(body.key, token || "");
  }
}
