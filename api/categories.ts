import axios from "axios";
import { ReactNode } from "react";

export interface CategoryItem {
  name: ReactNode;
  _id: string;
  key: string;
  label: string;
  icon: string;
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const { data } = await axios.get("http://192.168.7.245:8000/api/category");
  return data;
}
