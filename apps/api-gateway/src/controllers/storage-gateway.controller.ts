import { Controller, Post, Body, Req } from "@nestjs/common";
import { StorageGatewayService } from "../services/storage-gateway.service";
import { Request } from "express";

@Controller("storage")
export class StorageGatewayController {
  constructor(private readonly storageGatewayService: StorageGatewayService) {}

  @Post("upload-url")
  async getUploadUrl(
    @Body()
    body: {
      storeId: string;
      filename: string;
      contentType: string;
      contentLength: number;
    },
    @Req() req: Request
  ) {
    const token =
      req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];
    return this.storageGatewayService.getUploadUrl(
      body.storeId,
      body.filename,
      body.contentType,
      body.contentLength,
      token || ""
    );
  }

  @Post("delete")
  async deleteFile(@Body() body: { key: string }, @Req() req: Request) {
    const token =
      req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];
    return this.storageGatewayService.deleteFile(body.key, token || "");
  }
}
