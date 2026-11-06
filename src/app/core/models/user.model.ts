import { EventCategory } from './event.model';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  preferredCity: string;
  interestedCategories: EventCategory[];
  isGuest: boolean;
  memberSince?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
