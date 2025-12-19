import axios from "axios";

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

export default http;
