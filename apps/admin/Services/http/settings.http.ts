import http from "./index";
import { Settings, UpdateSettingsDto } from "@repo/dtos";

export class SettingsHttpService {
  async get(): Promise<Settings> {
    const { data } = await http.get<Settings>("/settings");
    return data;
  }

  async update(data: UpdateSettingsDto): Promise<Settings> {
    const { data: response } = await http.put<Settings>("/settings", data);
    return response;
  }
}

export default new SettingsHttpService();
