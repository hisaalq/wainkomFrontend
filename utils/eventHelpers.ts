import { EventItem, GeoPoint } from "@/types/EventTypes";

/**
 * Extract coordinates from event location
 * @param event - Event item
 * @returns [lng, lat] tuple or null if not available
 */
export function extractCoords(event: EventItem): [number, number] | null {
  if (typeof event.location === "string") return null;
  const c = event.location?.coordinates;
  if (
    Array.isArray(c) &&
    c.length === 2 &&
    Number.isFinite(c[0]) &&
    Number.isFinite(c[1])
  ) {
    return [c[0], c[1]]; 
  }
  return null;
}

/**
 * Get readable location string from event
 * @param event - Event item
 * @param locationCache - Optional cache of resolved location names
 * @returns Human-readable location string
 */
export function getReadableLocation(
  event: EventItem,
  locationCache?: Record<string, string>
): string {
  if ((event as any).placeName) return String((event as any).placeName);
  if ((event as any).address) return String((event as any).address);
  
  const coords = extractCoords(event);
  if (coords) {
    const [lng, lat] = coords;
    const key = `${lng.toFixed(5)},${lat.toFixed(5)}`;
    if (locationCache?.[key]) return locationCache[key];
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
  
  if (typeof event.location === "string") return event.location;
  return "Unknown location";
}

/**
 * Parse coordinates from location text (e.g., "lng,lat")
 * @param locationText - Location string in "lng,lat" format
 * @returns GeoPoint object or null
 */
export function parseLngLat(locationText: string): GeoPoint | null {
  const trimmed = locationText.trim();
  if (!trimmed) return null;
  
  const parts = trimmed.split(",").map(p => parseFloat(p.trim()));
  if (parts.length !== 2) return null;
  
  const [lng, lat] = parts;
  if (isNaN(lng) || isNaN(lat)) return null;
  
  return {
    type: "Point",
    coordinates: [lng, lat],
  };
}

/**
 * Create coordinate key for caching
 * @param lng - Longitude
 * @param lat - Latitude
 * @returns String key for coordinate pair
 */
export function coordKey(lng: number, lat: number): string {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/**
 * Sort events chronologically
 * @param events - Array of events
 * @param ascending - Sort order (default: true)
 * @returns Sorted events array
 */
export function sortEventsByDate(events: EventItem[], ascending: boolean = true): EventItem[] {
  return [...events].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return ascending ? timeA - timeB : timeB - timeA;
  });
}

/**
 * Group events by category
 * @param events - Array of events
 * @returns Object with categoryId as keys and event arrays as values
 */
export function groupEventsByCategory(events: EventItem[]): Record<string, EventItem[]> {
  const map: Record<string, EventItem[]> = {};
  
  for (const event of events) {
    const key = event.categoryId ?? "uncategorized";
    if (!map[key]) map[key] = [];
    map[key].push(event);
  }
  
  // Sort events within each category chronologically
  Object.keys(map).forEach(key => {
    map[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });
  
  return map;
}

/**
 * Get event ID from various formats
 * @param event - Event or partial event object
 * @returns Event ID string
 */
export function getEventId(event?: Partial<EventItem> | null): string {
  return (event as any)?._id ?? (event as any)?.id ?? "";
}

