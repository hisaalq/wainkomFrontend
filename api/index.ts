// api/index.ts
import axios from "axios";
import { getToken } from "./storage";

// Prefer env-configured API base URL; fall back to production server
export const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://wainkombackend.onrender.com/api";

// Useful for building absolute asset URLs when backend returns relative paths
export const apiOrigin = apiBaseUrl.replace(/\/?api\/?$/i, "");

const instance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 60000, // 60 second timeout (Render free tier can take 30-60s to wake up)
});

instance.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for better error messages
instance.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️  Request timeout - Server may be waking up (Render free tier). Please wait and try again.');
    } else if (error.response) {
      console.error(`❌ API Error ${error.response.status}: ${error.config.url}`);
    } else if (error.request) {
      console.error('❌ No response from server. Check your internet connection.');
    } else {
      console.error('❌ Request failed:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
