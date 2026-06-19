import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard, Roles, RolesGuard } from "@repo/auth-guard";
import { SettingsService } from "../services/settings.service";
import { Settings } from "@repo/database";

@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(): Promise<Settings> {
    return this.settingsService.getSettings();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async updateSettings(@Body() data: Partial<Settings>): Promise<Settings> {
    // Remove ID from body to prevent overwrite attempts on fixed ID
    const { id, ...updateData } = data as any;
    return this.settingsService.updateSettings(updateData);
  }
}
