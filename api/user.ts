import { UserInfo, UserInfoMore } from "@/types";
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

const updateUser = async (userInfo: Partial<UserInfoMore>) => {
  const { data } = await instance.put<UserInfoMore>("/updateprofile", userInfo);
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


  export { getUserInfo, updateUser };

