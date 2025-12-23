import http from "./index";
import { CreateStoreDto, Store, PaginatedResult } from "@repo/dtos";

export default {
  create(form: CreateStoreDto) {
    // For now, send as JSON. We'll handle file upload later.
    // When we add file upload, we'll convert to FormData
    const payload = {
      name: form.name,
      address: form.address,
      phone: form.phone,
      site: form.site,
      facebookLink: form.facebookLink,
      instagramLink: form.instagramLink,
      youtubeLink: form.youtubeLink,
      // image will be handled later
    };

    return http.post<Store>("stores", payload).then((res) => res.data);
  },

  // Placeholders for other methods
  list(params?: { page?: number; search?: string }) {
    return http
      .get<PaginatedResult<Store>>("stores", {
        params: {
          page: params?.page,
          search: params?.search,
        },
      })
      .then((res) => res.data);
  },

  update(id: string, form: Partial<CreateStoreDto>) {
    return http.put<Store>(`stores/${id}`, form).then((res) => res.data);
  },

  delete(id: string) {
    return http.delete<void>(`stores/${id}`).then((res) => res.data);
  },
};
