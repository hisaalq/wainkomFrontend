import { Engagement } from "@/types/EventTypes";
import instance from ".";

// Re-export type for backward compatibility
export type { Engagement };

export const saveEngagementApi = async (eventId: string) => {
  const { data } = await instance.post("/engagement", { eventId });
  return data;
};

export const removeEngagementApi = async (id: string) => {
  const { data } = await instance.delete(`/engagement/${id}`);
  return data;
};
export async function fetchEngagementByIdApi(): Promise<Engagement[]> {
  // Fetches engagements for the currently authenticated user (based on token)
  const { data } = await instance.get(`/engagement`);
  return data;
}
