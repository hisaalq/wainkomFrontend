//sign in / sign up
export interface UserInfo {
  username: string;
  email: string;
  image: string;
  bio: string;
  rating: number;
  Events: Event[];
  createdAt: string;
  updatedAt: string;
}
