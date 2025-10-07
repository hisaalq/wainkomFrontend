//sign in / sign up
export interface UserInfo {
  username: string;
  email: string;
  image: string;
  bio: string;
  phone:string;
  rating: number;
  Events: Event[];
  createdAt: string;
  updatedAt: string;
}
