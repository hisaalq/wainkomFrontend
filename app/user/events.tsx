import { useLocalSearchParams } from "expo-router";
import EventsHeader from "../../components/EventsHeader";

export default function event() {
  const params = useLocalSearchParams();
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : undefined;
  return <EventsHeader userId={""} initialCategoryId={categoryId} />
}
