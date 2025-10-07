import instance from "./index";

export async function createEngagement(eventId: string) {
  const { data } = await instance.post("/engagement", { eventId });
  return data;
}


