import { EventItem } from "@/types/EventTypes";

/**
 * Get events happening this weekend (Saturday-Sunday)
 */
export function getThisWeekend(events: EventItem[]): EventItem[] {
  const now = new Date();
  const today = now.getDay(); // 0 = Sunday, 6 = Saturday
  const daysUntilSaturday = (6 - today) % 7;
  const daysUntilSunday = (7 - today) % 7;
  
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + daysUntilSaturday);
  saturday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + daysUntilSunday);
  sunday.setHours(23, 59, 59, 999);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= saturday && eventDate <= sunday;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get events happening next week (Monday-Sunday)
 */
export function getNextWeek(events: EventItem[]): EventItem[] {
  const now = new Date();
  const nextMonday = new Date(now);
  const daysUntilMonday = (8 - now.getDay()) % 7;
  nextMonday.setDate(now.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));
  nextMonday.setHours(0, 0, 0, 0);
  
  const nextSunday = new Date(nextMonday);
  nextSunday.setDate(nextMonday.getDate() + 6);
  nextSunday.setHours(23, 59, 59, 999);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= nextMonday && eventDate <= nextSunday;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get events happening this week (Sunday-Saturday)
 */
export function getThisWeek(events: EventItem[]): EventItem[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= startOfWeek && eventDate <= endOfWeek;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get events happening this month
 */
export function getThisMonth(events: EventItem[]): EventItem[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= startOfMonth && eventDate <= endOfMonth;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Check if an event date falls within a specific period
 */
export function isDateInPeriod(
  eventDate: string,
  period: "date_week" | "date_weekend" | "date_next_week" | "date_month" | "date_year",
  customStart?: Date,
  customEnd?: Date
): boolean {
  const now = new Date();
  const event = new Date(eventDate);

  if (event < now) return false;

  let start = new Date(now);
  let end = new Date(now);

  if (period === "date_week") {
    end.setDate(now.getDate() + 7);
  } else if (period === "date_weekend") {
    // Find next weekend (Saturday-Sunday)
    const today = now.getDay();
    const daysUntilSaturday = (6 - today) % 7;
    const daysUntilSunday = (7 - today) % 7;
    
    start = new Date(now);
    start.setDate(now.getDate() + daysUntilSaturday);
    start.setHours(0, 0, 0, 0);
    
    end = new Date(now);
    end.setDate(now.getDate() + daysUntilSunday);
    end.setHours(23, 59, 59, 999);
  } else if (period === "date_next_week") {
    // Find next week (Monday-Sunday)
    const daysUntilMonday = (8 - now.getDay()) % 7;
    start = new Date(now);
    start.setDate(now.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));
    start.setHours(0, 0, 0, 0);
    
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (period === "date_month") {
    end.setMonth(now.getMonth() + 2);
    end.setDate(0);
  } else if (period === "date_year") {
    end.setFullYear(now.getFullYear() + 1);
  }

  return event >= start && event <= end;
}

/**
 * Format date string to readable format
 */
export function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  } catch {
    return "Invalid date";
  }
}

/**
 * Format time string to readable format
 */
export function formatTime(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(dateString));
  } catch {
    return "Invalid time";
  }
}

/**
 * Format date nicely (e.g., "Jan 15, 2025")
 */
export function formatDateNice(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Combine date and time into single Date object
 */
export function combineDateAndTime(date: Date, time: Date): Date {
  const combined = new Date(date);
  combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return combined;
}

