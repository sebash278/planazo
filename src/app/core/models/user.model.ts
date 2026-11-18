import type { EventCategory } from './event.model';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  preferredCity: string;
  interestedCategories: EventCategory[];
  isGuest: boolean;
  memberSince?: string;
  authProvider?: 'local' | 'google';
}

export type User = UserProfile;

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
