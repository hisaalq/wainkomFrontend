import EventsHeader from "@/components/user/EventsHeader";
import { useLocalSearchParams } from "expo-router";

export default function event() {
  const params = useLocalSearchParams();
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : undefined;
  return <EventsHeader userId={""} initialCategoryId={categoryId} />
}
