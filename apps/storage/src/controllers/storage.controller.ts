import { Controller, Post, Body, Delete, UseGuards } from "@nestjs/common";
import { StorageService } from "../services/storage.service";
// import { JwtAuthGuard } from '@repo/auth-guard'; // Commented out until we confirm library path/usage

@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("upload-url")
  // @UseGuards(JwtAuthGuard)
  async getUploadUrl(
    @Body() body: { storeId: string; filename: string; contentType: string }
  ) {
    return this.storageService.getUploadUrl(
      body.storeId,
      body.filename,
      body.contentType
    );
  }

  @Post("delete")
  // @UseGuards(JwtAuthGuard)
  async deleteFile(@Body() body: { key: string }) {
    return this.storageService.deleteFile(body.key);
  }
}
