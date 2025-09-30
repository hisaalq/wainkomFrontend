import instance from ".";
export interface EventItem {
  _id: string;
  title: string;
  desc: string;
  description?: string;
  image: string;
  location: any;
  date: string;
  time: string;
  rating: number;
}

export const fetchEvents = async (): Promise<EventItem[]> => {
  try {
    const { data } = await instance.get(`/events`);
    console.log("✅ fetchEvents response:", data);
    return data || []; // لازم يرجع array حتى لو فاضي
  } catch (err) {
    console.error("❌ fetchEvents error:", err);
    return []; // عشان ما يرجع undefined
  }
};

export const fetchEventById = async (id: string): Promise<EventItem> => {
  try {
    const { data } = await instance.get(`/events/${id}`);
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
  image: string; // URL or local uri (string) — backend expects string
  location: [number, number]; // [lng, lat]
  date: string; // ISO string
  time: string; // "6:00 PM"
  duration: string; // required by your schema
  categoryId?: string; // optional
};

export async function createEventApi(body: CreateEventBody) {
  const { data } = await instance.post("/events", body);
  return data;
}

export async function fetchEventsApi(): Promise<EventItem[]> {
  const { data } = await instance.get("/events");
  return data;
}


