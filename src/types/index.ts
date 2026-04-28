export type UserRole = 'student' | 'club_admin' | 'main_admin';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string;
  created_at: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  tagline: string;
  admin_id: string;
  logo_url: string;
  banner_url: string;
  founded_year: number | null;
  category: string;
  created_at: string;
  profiles?: Profile;
}

export interface ClubMember {
  id: string;
  club_id: string;
  name: string;
  position: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface ClubGalleryImage {
  id: string;
  club_id: string;
  image_url: string;
  caption: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  banner_url: string;
  is_grafest: boolean;
  creator_id: string;
  club_id: string | null;
  max_attendees: number | null;
  tags: string[];
  status: 'upcoming' | 'past';
  created_at: string;
  profiles?: Profile;
  clubs?: Club;
  _count?: { registrations: number };
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
  events?: Event;
}

export interface GrafestGalleryImage {
  id: string;
  image_url: string;
  caption: string;
  year: number | null;
  uploaded_by: string | null;
  created_at: string;
}
