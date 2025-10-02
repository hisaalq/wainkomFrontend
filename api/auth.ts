import { LoginInfo } from "@/types/LoginInfo";
import instance from "./index";
import { storeToken } from "./storage";


type RegisterResponse = { 
  token: string; 
  user?: any; 
  organizer?: any;
  message?: string; 
};

const register = async (userInfo: any) => {
  const { verifyPassword, username, email, password, isOrganizer, ...organizerFields } = userInfo;
  const payload: any = {
    username,
    email,
    password,
    isOrganizer,
  };
  
  // Add organizer fields if registering as organizer
  if (isOrganizer) {
    payload.orgName = organizerFields.orgName;
    payload.orgAddress = organizerFields.orgAddress;
    payload.orgImage = organizerFields.orgImage;
    payload.orgPhone = organizerFields.orgPhone;
    payload.orgEmail = organizerFields.orgEmail;
    if (organizerFields.orgBio) payload.orgBio = organizerFields.orgBio;
    if (organizerFields.orgWebsite) payload.orgWebsite = organizerFields.orgWebsite;
  }
  
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

