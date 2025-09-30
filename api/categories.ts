import { ReactNode } from "react";
import instance from ".";

export interface CategoryItem {
  name: ReactNode;
  _id: string;
  key: string;
  label: string;
  icon: string;
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const { data } = await instance.get("/category");
  return data;
}
