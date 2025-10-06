import { UserInfo } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import instance from ".";

export const getProfile = async () => {
  const resp = await instance.get("/user/profile/");
  return resp.data; 
};

export const getuser = async () => {
  const resp = await instance.get("/user/");
  return resp.data; 
};

export const updateUser = async (userInfo: Partial<UserInfo>) => {
  const { data } = await instance.put<UserInfo>("/updateprofile", userInfo);
  return data;
};
  

export const logout = async () => {
  await AsyncStorage.removeItem("token");
};


