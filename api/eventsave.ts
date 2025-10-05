import instance from ".";
import { EventItem } from "./events";

export interface Engagement {
  _id: string;
  user: string;
  event: EventItem; // <- populated Event
  attended?: boolean;
  createdAt: string;
  updatedAt: string;
}

// إنشاء مشاركة (Engagement)r

export const saveEngagementApi = async (eventId: string) => {
  const { data } = await instance.post("/engagement", { eventId });
  return data;
};

export const removeEngagementApi = async (id: string) => {
  const { data } = await instance.delete(`/engagement/${id}`);
  return data;
};

// جلب الايفنتات الخاصة بمشاركة معينة
export async function fetchEngagementByIdApi(
  userId: string
): Promise<Engagement[]> {
  const { data } = await instance.get(`/engagement/${userId}`);
  return data;
}
