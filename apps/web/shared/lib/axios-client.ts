import axios from "axios";
import { CONFIG } from "./config";

const axiosClient = axios.create({
  withCredentials: true,
  baseURL: CONFIG.API_URL,
});

// Interceptor to handle SSR cookie forwarding
axiosClient.interceptors.request.use(async (config) => {
  // Check if we are running on the server
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    // Serialize all cookies into a string
    const cookieString = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    if (cookieString) {
      config.headers.Cookie = cookieString;
    }
  }
  return config;
});

export default axiosClient;
