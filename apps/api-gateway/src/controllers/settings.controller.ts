import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { SettingsService } from "../services/settings.service";
import { Settings } from "@repo/database";
// import { AuthGuard } from '@nestjs/passport'; // Uncomment if auth is needed

@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(): Promise<Settings> {
    return this.settingsService.getSettings();
  }

  @Put()
  // @UseGuards(AuthGuard('jwt')) // Uncomment if auth is needed logic
  async updateSettings(@Body() data: Partial<Settings>): Promise<Settings> {
    // Remove ID from body to prevent overwrite attempts on fixed ID
    const { id, ...updateData } = data as any;
    return this.settingsService.updateSettings(updateData);
  }
}
