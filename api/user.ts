import { UserInfo } from "@/types";
import instance from ".";

export const getProfile = async () => {
  const { data } = await instance.get<UserInfo>("/profile");
  return data;
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

  export { getUserInfo, updateUser };
