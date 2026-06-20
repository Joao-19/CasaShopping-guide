import http from "./index";
import { CreateStoreDto, Store, PaginatedResult } from "@repo/dtos";

export default {
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

  getBySlug(slug: string) {
    return http.get<Store>(`stores/slug/${slug}`).then((res) => res.data);
  },
};
