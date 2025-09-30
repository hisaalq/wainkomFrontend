// import axios from "axios";

// export interface EventItem {
//   _id: string;
//   title: string;
//   desc: string;
//   date: string;
//   time: string;
//     location: { coordinates?: [number, number] } | string; // Explicitly define location type

//   rating: number;
//   image: string;
// }

// export async function fetchEvents(): Promise<EventItem[]> {
//   const res = await axios.get("http://192.168.7.245:8000/api/events");
//   return res.data;
// }
// import axios from "axios";
// import instance from ".";

// export type EventItem = {
//   _id: string;
//   title: string;
//   desc: string;
//   date: string;
//   time: string;
//   location: string | { type: string; coordinates: number[] };
//   rating: number;
//   image: string;
// };

// export const fetchEvents = async (): Promise<EventItem[]> => {
//   const res = instance.get("api/events")
//   // const res = await axios.get("http://192.168.7.245:8000/api/events");
//   return (await res).data;
// };

// export const fetchEventDetails = async (id: string): Promise<EventItem> => {

//   const res = await axios.get(`http://192.168.7.245:8000/api/events/${id}`);
//   console.log(res.data.data);
//   return res.data;
// };
import axios from "axios";
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

const BASE_URL = "http://192.168.7.245:8000/api"; // تأكد إنه صحيح

export const fetchEvents = async (): Promise<EventItem[]> => {
  try {
    const { data } = await axios.get(`${BASE_URL}/events`);
    console.log("✅ fetchEvents response:", data);
    return data || []; // لازم يرجع array حتى لو فاضي
  } catch (err) {
    console.error("❌ fetchEvents error:", err);
    return []; // عشان ما يرجع undefined
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

