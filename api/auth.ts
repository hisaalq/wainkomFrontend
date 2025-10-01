import { LoginInfo } from "@/types/LoginInfo";
import { SignUpInfo } from "@/types/SignupInfo";
import instance from "./index";
import { storeToken } from "./storage";


type RegisterResponse = { token: string; user?: any; message?: string };

const register = async (userInfo: SignUpInfo) => {
  const { verifyPassword, username, email, password, isOrganizer } = userInfo;
  const payload = {
    username,
    email,
    password,
    isOrganizer,
  };
  const { data } = await instance.post<RegisterResponse>("/auth/signup", payload);
  await storeToken(data.token);
  return data;
};

const login = async (userInfo: LoginInfo) => {
  const { data } = await instance.post<RegisterResponse>("/auth/signin", userInfo);
  await storeToken(data.token);
  return data;
};


export { login, register };
