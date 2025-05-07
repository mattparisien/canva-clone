export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  accessToken?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  company?: string;
  location?: string;
  bio?: string;
  joinedAt: string;
  profilePictureUrl?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  company?: string;
  location?: string;
  bio?: string;
}