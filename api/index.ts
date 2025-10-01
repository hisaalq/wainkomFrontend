// api/index.ts
import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getToken } from "./storage";

// 1) Figure out the right host for dev
const emulatorHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";

// If running on a real device with Expo, grab your LAN IP from hostUari
const hostUri =
  (Constants.expoConfig as any)?.hostUri ??
  (Constants.manifest as any)?.hostUri;
const lanHost = hostUri ? hostUri.split(":")[0] : emulatorHost;

// 2) Allow override via env var (recommended)
const BASE =
  process.env.EXPO_PUBLIC_API_URL || // e.g. https://your-ngrok.ngrok-free.app
  `http://${lanHost}:8000/api`; // fallback for local dev

const instance = axios.create({ baseURL: BASE });

instance.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
