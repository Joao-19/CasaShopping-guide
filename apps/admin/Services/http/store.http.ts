import http from "./index";
import { CreateStoreDto, Store } from "@repo/dtos";

export default {
  create(form: CreateStoreDto) {
    // If we need to send as FormData for file upload:
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("location", form.location);
    if (form.phone) formData.append("phone", form.phone);
    if (form.website) formData.append("website", form.website);
    if (form.facebook) formData.append("facebook", form.facebook);
    if (form.instagram) formData.append("instagram", form.instagram);
    if (form.youtube) formData.append("youtube", form.youtube);
    if (form.image) {
      formData.append("image", form.image);
    }

    return http
      .post<Store>("stores", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  },

  // Placeholders for other methods
  list() {
    return http.get<Store[]>("stores").then((res) => res.data);
  },

  update(id: string, form: Partial<CreateStoreDto>) {
    return http.put<Store>(`stores/${id}`, form).then((res) => res.data);
  },

  delete(id: string) {
    return http.delete<void>(`stores/${id}`).then((res) => res.data);
  },
};
