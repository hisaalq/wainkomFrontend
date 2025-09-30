// app/api/events.ts
import api from "./index"; // your axios instance (with getToken interceptor)

// Adjust this prefix to how you mount on the server (see backend section).
const BASE = "/api/events";

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
  const { data } = await api.post(BASE, body);
  return data;
}

export async function fetchEventsApi() {
  const { data } = await api.get(BASE);
  return [];
}

// Optional helpers you may need later:
// export const getEventsByOrg = (orgId: string) => api.get(`${BASE}/org/${orgId}`);
// export const getEventsByCategory = (categoryId: string) => api.get(`${BASE}/${categoryId}`);
// export const updateEventApi = (id: string, updates: Partial<CreateEventBody>) => api.put(`${BASE}/${id}`, updates);
// export const deleteEventApi = (id: string) => api.delete(`${BASE}/${id}`);
