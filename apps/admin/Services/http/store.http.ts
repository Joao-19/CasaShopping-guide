import http from "./index";
import { CreateStoreDto, Store, PaginatedResult } from "@repo/dtos";

export default {
  create(form: CreateStoreDto) {
    // For now, send as JSON. We'll handle file upload later.
    // When we add file upload, we'll convert to FormData
    const payload = {
      name: form.name,
      slug: form.slug,
      address: form.address,
      phone: form.phone,
      site: form.site,
      facebookLink: form.facebookLink,
      instagramLink: form.instagramLink,
      youtubeLink: form.youtubeLink,
      whatsapp: form.whatsapp,
      logoImage: form.logoImage,
      bannerImage: form.bannerImage,
    };

    return http.post<Store>("stores", payload).then((res) => res.data);
  },

  checkSlug(slug: string, excludeId?: string) {
    return http
      .get<{ available: boolean }>("stores/slug-available", {
        params: { slug, excludeId },
      })
      .then((res) => res.data);
  },

  // Placeholders for other methods
  list(params?: { page?: number; search?: string; limit?: number }) {
    return http
      .get<PaginatedResult<Store>>("stores", {
        params: {
          page: params?.page,
          search: params?.search,
          limit: params?.limit,
        },
      })
      .then((res) => res.data);
  },

  getById(id: string) {
    return http.get<Store>(`stores/${id}`).then((res) => res.data);
  },

  update(id: string, form: Partial<CreateStoreDto>) {
    return http.put<Store>(`stores/${id}`, form).then((res) => res.data);
  },

  delete(id: string) {
    return http.delete<void>(`stores/${id}`).then((res) => res.data);
  },
};
