// User profile model coming from backend
export interface UserInfo {
  _id: string;
  username: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  phone?: string | null;
  engagements?: string | string[] | null; // backend may send id(s)
  posts?: string | string[] | null;
  organization?: string | null;
  isOrganizer: boolean;
  createdAt: string;
  updatedAt: string;
}
