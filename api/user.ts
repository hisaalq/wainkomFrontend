import { UserInfo } from "@/types";
import instance from ".";
import AsyncStorage from "@react-native-async-storage/async-storage";
export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}
export const getProfile = async () => {
  const resp = await instance.get(`/user/profile/`);
  return resp.data; 
};
export const getuser = async () => {
  const resp = await instance.get("/user");
  return resp.data; 
};
const updateUser = async (userInfo: Partial<UserInfo>) => {
  const { data } = await instance.put<UserInfo>("/updateprofile", userInfo);
  return data;
};
  const getUserInfo = async () => {
    try{
    const { data } = await instance.get<UserInfo[]>("/users");
    return data;
    } catch (error) {
      console.error("Error getting users:", error);
      throw error;
    }
  };
  

export const logout = async () => {
  await AsyncStorage.removeItem("token");
};


  export { getUserInfo, updateUser, };
