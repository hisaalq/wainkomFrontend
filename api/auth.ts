import { LoginInfo } from "@/types/LoginInfo";
import { SignUpInfo } from "@/types/SignupInfo";
import instance from "./index";
import { storeToken } from "./storage";


type RegisterResponse = { token: string; user?: any; message?: string };

const register = async (userInfo: SignUpInfo) => {
  const { verifyPassword, name, email, password, type } = userInfo;
  const payload = {
    username: name,
    email,
    password,
    isOrganizer: type === "organizer",
  };
  const { data } = await instance.post<RegisterResponse>("/api/auth/signup", payload);
  await storeToken(data.token);
  return data;
};

const login = async (userInfo: LoginInfo) => {
  const { data } = await instance.post<RegisterResponse>("/api/auth/signin", userInfo);
  await storeToken(data.token);
  return data;
};


export { login, register };
