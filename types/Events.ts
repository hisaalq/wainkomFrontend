export type EventItem = {
    id: string;
    title: string;
    location: string;           // human-readable address
    lat: number;
    lng: number;
    startsAt?: string;          // ISO
    endsAt?: string;            // ISO
    category?: string;
  };
  