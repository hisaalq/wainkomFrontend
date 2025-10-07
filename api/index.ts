// api/index.ts
import axios from "axios";
import { getToken } from "./storage";

// Prefer env-configured API base URL; fall back to localhost
const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://172.20.10.10:8000/api";

const instance = axios.create({
  baseURL: apiBaseUrl,
});

instance.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
