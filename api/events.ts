import axios from "axios";
import instance from ".";
export interface EventItem {
  categoryId: string;
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

const BASE_URL = "http://192.168.7.245:8000/api"; 

export const fetchEvents = async (): Promise<EventItem[]> => {
  try {
    const { data } = await axios.get(`${BASE_URL}/events/`);
    console.log("✅ fetchEvents response:", data);
    return data || []; 
  } catch (err) {
    console.error("❌ fetchEvents error:", err);
    return []; 
  }
};

export const fetchEventById = async (id: string): Promise<EventItem> => {
  try {
    const { data } = await axios.get(`${BASE_URL}/events/${id}`);
    console.log("✅ fetchEventById response:", data);
    return data;
  } catch (err) {
    console.error("❌ fetchEventById error:", err);
    throw err;
  }
};


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
  return data;
}


