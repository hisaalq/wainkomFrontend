import { OrganizerInfo } from "@/types/OrganizerInfo";
import instance from ".";

export const getOrgProfile = async () => {
  const { data } = await instance.get<OrganizerInfo>("/organizer/my-profile");
  return data;
};


export const updateOrganizerInfo = async (organizerInfo: OrganizerInfo) => {
  const { data } = await instance.put<OrganizerInfo>("/organizer/${id}", organizerInfo);
  return data;
};


