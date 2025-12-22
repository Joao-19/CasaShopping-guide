import axios from "axios";
import { eventBus } from "@/utils/eventBus";
import { translateError } from "@/utils/errorTranslation";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `${protocol}//${hostname}:3000`;
    }
  }
  return "http://localhost:3000";
};

const http = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Translate message
    const message = translateError(error);

    // Emit global error event
    eventBus.emit("api-error", message);

    return Promise.reject(error);
  }
);

export default http;
