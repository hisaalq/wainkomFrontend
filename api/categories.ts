import { CategoryItem } from "@/types/EventTypes";
import instance from ".";

// Re-export type for backward compatibility
export type { CategoryItem };

export async function fetchCategories(): Promise<CategoryItem[]> {
  const { data } = await instance.get("/category");
  return data;
}
