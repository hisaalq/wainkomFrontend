import { CreateEventBody, EventItem, GeoPoint } from "@/types/EventTypes";
import instance from ".";

// Re-export types for backward compatibility
export type { CreateEventBody, EventItem, GeoPoint };

/** ---------- URL normalizer so images always work in RN ---------- **/
const API_BASE = instance.defaults.baseURL || "";
// If baseURL is like http://host:8000/api, strip the /api so we can prefix /uploads
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");
const toAbs = (u?: string) =>
  !u ? u : /^https?:\/\//i.test(u) ? u : `${API_ORIGIN}${u}`;
const mapEvent = (e: any): EventItem => ({ ...e, image: toAbs(e?.image) });
const mapList = (arr: any[]) => (Array.isArray(arr) ? arr.map(mapEvent) : []);

/** ---------- FormData helper for RN (matches upload.single("image")) ---------- **/
export function buildEventFormData(
  body: CreateEventBody,
  imageUri: string
): FormData {
  const fd = new FormData();

  fd.append("title", body.title);
  fd.append("description", body.description);
  fd.append("date", body.date);
  fd.append("time", body.time);
  fd.append("duration", body.duration);
  if (body.categoryId) fd.append("categoryId", body.categoryId);
  if (body.placeName) fd.append("placeName", body.placeName);
  if (body.address) fd.append("address", body.address);

  // location as JSON string so backend can JSON.parse if needed
  fd.append("location", JSON.stringify(body.location));

  // file part
  const filename = imageUri.split("/").pop() || "image.jpg";
  const ext = filename.split(".").pop()?.toLowerCase();
  const mime =
    ext === "png"
      ? "image/png"
      : ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : "image/*";

  // @ts-ignore React Native file part
  fd.append("image", {
    uri: imageUri,
    name: filename,
    type: mime,
  } as any);

  return fd;
}

/** ---------- API calls ---------- **/
export const fetchEvents = async (): Promise<EventItem[]> => {
  try {
    const { data } = await instance.get(`/events`);
    return mapList(data || []);
  } catch (err) {
    console.error("❌ fetchEvents error:", err);
    return [];
  }
};

export const fetchEventById = async (id: string): Promise<EventItem> => {
  try {
    const { data } = await instance.get(`/events/event/${id}`);
    return mapEvent(data);
  } catch (err) {
    console.error("❌ fetchEventById error:", err);
    throw err;
  }
};

export async function createEventApi(body: FormData | CreateEventBody) {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const { data } = await instance.post("/events", body, {
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
  });

  // normalize for immediate UI usage
  return mapEvent(data);
}

export async function fetchEventsApi(): Promise<EventItem[]> {
  const { data } = await instance.get("/events");
  return mapList(data || []);
}

export const updateEventApi = async (
  id: string,
  payload: FormData | (Partial<EventItem> & Partial<CreateEventBody>)
) => {
  const isFormData =
    typeof FormData !== "undefined" && payload instanceof FormData;

  const { data } = await instance.put(`/events/${id}`, payload, {
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
  });

  return mapEvent(data);
};

export async function fetchEventsByOrganizer(
  orgId: string
): Promise<EventItem[]> {
  try {
    const { data } = await instance.get(`/events/org/${orgId}`);
    return mapList(data || []);
  } catch (err) {
    console.error("❌ fetchEventsByOrganizer error:", err);
    return [];
  }
}

export const deleteEventApi = async (id: string) => {
  const { data } = await instance.delete(`/events/${id}`);
  return data;
};
