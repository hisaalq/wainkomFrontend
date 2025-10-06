import instance from ".";

export type GeoPoint = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
};

export interface EventItem {
  _id: string;
  title: string;
  desc?: string; // some places use `desc`
  description?: string; // some places use `description`
  image: string;
  location?: GeoPoint | string | null;
  date: string; // ISO string
  time: string; // e.g., "6:00 PM"
  rating?: number;
  categoryId?: string;
}

export const fetchEvents = async (): Promise<EventItem[]> => {
  try {
    const { data } = await instance.get(`/events`);
    return data || [];
  } catch (err) {
    console.error("❌ fetchEvents error:", err);
    return [];
  }
};

export const fetchEventById = async (id: string): Promise<EventItem> => {
  try {
    const { data } = await instance.get(`/events/event/${id}`);
    console.log("✅ fetchEventById response:", data);
    return data;
  } catch (err) {
    console.error("❌ fetchEventById error:", err);
    throw err;
  }
};

export type CreateEventBody = {
  title: string;
  description: string;
  image: string; // URL or local uri
  location: [number, number]; // [lng, lat]
  date: string; // ISO
  time: string; // "6:00 PM"
  duration: string;
  categoryId?: string;
};

export async function createEventApi(body: CreateEventBody) {
  const { data } = await instance.post("/events", body);
  return data;
}

export async function fetchEventsApi(): Promise<EventItem[]> {
  const { data } = await instance.get("/events");
  return data;
}

export const updateEventApi = async (
  id: string,
  payload: Partial<EventItem> & Partial<CreateEventBody>
) => {
  const { data } = await instance.put(`/events/${id}`, payload);
  return data;
};

export async function fetchEventsByOrganizer(orgId: string): Promise<EventItem[]> {
  try {
    const { data } = await instance.get(`/events/org/${orgId}`);
    return data || [];
  } catch (err) {
    console.error("❌ fetchEventsByOrganizer error:", err);
    return [];
  }
}

export const deleteEventApi = async (id: string) => {
  const { data } = await instance.delete(`/events/${id}`);
  return data;
};
