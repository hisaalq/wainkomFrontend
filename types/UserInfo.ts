//sign in / sign up
export interface UserInfo {
  username: string;
  email: string;
  isOrganizer?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

//user more
export interface UserInfoMore {
  username: string;
  email: string;
  image: string;
  bio: string;
  rating: number;
  Events: Event[];
  createdAt: string;
  updatedAt: string;
}
