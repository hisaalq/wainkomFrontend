import { ReactNode } from "react";

// ============================================
// EVENT TYPES
// ============================================

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
  organizerId?: string;
  organizerName?: string;
  organizerInfo?: {
    name: string;
    bio?: string;
    rating?: number;
    image?: string;
  };
}

export type CreateEventBody = {
  title: string;
  description: string;
  image: string; // URL or local uri (RN)
  location: [number, number]; // [lng, lat]
  date: string; // ISO
  time: string; // "6:00 PM"
  duration: string;
  categoryId?: string;
  // optional extras your backend may accept:
  placeName?: string;
  address?: string;
};

// ============================================
// CATEGORY TYPES
// ============================================

export interface CategoryItem {
  name: ReactNode;
  _id: string;
  key: string;
  label: string;
  icon: string;
}

// ============================================
// ENGAGEMENT TYPES
// ============================================

export interface Engagement {
  _id: string;
  user: string;
  event: EventItem; // <- populated Event
  attended?: boolean;
  createdAt: string;
  updatedAt: string;
}

