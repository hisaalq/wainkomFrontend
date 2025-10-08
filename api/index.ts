// api/index.ts
import axios from "axios";
import { getToken } from "./storage";

// Prefer env-configured API base URL; fall back to localhost
export const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:8000/api";
export const nBaseURL = "https://wainkombackend.onrender.com";
// Useful for building absolute asset URLs when backend returns relative paths
export const apiOrigin = apiBaseUrl.replace(/\/?api\/?$/i, "");

const instance = axios.create({
  baseURL: apiBaseUrl,
});

instance.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
