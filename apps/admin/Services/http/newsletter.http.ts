import http from "./index";
import { NewsletterSettings, UpdateNewsletterDto } from "@repo/dtos";

export class NewsletterHttpService {
  async get(): Promise<NewsletterSettings> {
    const { data } = await http.get<NewsletterSettings>("/newsletter");
    return data;
  }

  async update(data: UpdateNewsletterDto): Promise<NewsletterSettings> {
    const { data: response } = await http.put<NewsletterSettings>(
      "/newsletter",
      data,
    );
    return response;
  }
}

export default new NewsletterHttpService();
