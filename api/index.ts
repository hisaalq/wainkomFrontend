// api/index.ts
import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getToken } from "./storage";

const instance = axios.create({
  baseURL: "http://172.20.10.9:8000/api",
});

instance.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export default instance;
