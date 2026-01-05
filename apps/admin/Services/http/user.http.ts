import http from "./index";
import { UserResponseDto, PaginatedResult } from "@repo/dtos";

export default {
  list(params?: { page?: number; search?: string }) {
    return http
      .get<PaginatedResult<UserResponseDto>>("users", {
        params: {
          page: params?.page,
          search: params?.search,
        },
      })
      .then((res) => res.data);
  },

  delete(id: string) {
    return http.delete(`users/${id}`).then((res) => res.data);
  },

  export() {
    return http
      .get("users/export", {
        responseType: "blob",
      })
      .then((res) => res.data);
  },
};
