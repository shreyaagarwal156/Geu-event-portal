/*
  # GEUEvent Complete Schema

  ## Overview
  Full schema for the GEUEvent university event management portal.

  ## New Tables

  ### profiles
  Extends Supabase auth.users with role and display info.
  - `id` - references auth.users
  - `name` - display name
  - `email` - user email
  - `role` - 'student' | 'club_admin' | 'main_admin'
  - `avatar_url` - profile picture URL

  ### clubs
  Club profiles managed by club admins.
  - `id`, `name`, `description`, `admin_id`, `logo_url`, `banner_url`

  ### club_members
  Position holders within a club.
  - `club_id`, `name`, `position`, `image_url`

  ### club_gallery
  Photo gallery for each club.
  - `club_id`, `image_url`, `caption`

  ### events
  All events including Grafest mega-events.
  - `is_grafest` boolean distinguishes Grafest events
  - `creator_id` tracks ownership for RBAC
  - `club_id` links to organizing club
  - `status` auto-managed: 'upcoming' | 'past'

  ### event_registrations
  Many-to-many between users and events.
  - Unique constraint prevents duplicate registrations

  ### grafest_gallery
  Dedicated gallery for past Grafest memories.
  - `year`, `image_url`, `caption`, `uploaded_by`

  ## Security
  - RLS enabled on all tables
  - Policies enforce role-based access control
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'club_admin', 'main_admin')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- CLUBS
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  logo_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  founded_year INTEGER,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clubs are viewable by everyone"
  ON clubs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Club admins can insert clubs"
  ON clubs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Club admins can update their clubs"
  ON clubs FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id)
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Club admins can delete their clubs"
  ON clubs FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);

-- CLUB MEMBERS (position holders)
CREATE TABLE IF NOT EXISTS club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club members are viewable by everyone"
  ON club_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Club admins can manage their club members"
  ON club_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = club_id AND clubs.admin_id = auth.uid()
    )
  );

CREATE POLICY "Club admins can update their club members"
  ON club_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = club_id AND clubs.admin_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = club_id AND clubs.admin_id = auth.uid()
    )
  );

CREATE POLICY "Club admins can delete their club members"
  ON club_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = club_id AND clubs.admin_id = auth.uid()
    )
  );

-- CLUB GALLERY
CREATE TABLE IF NOT EXISTS club_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE club_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club gallery is viewable by everyone"
  ON club_gallery FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Club admins can insert gallery images"
  ON club_gallery FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = club_id AND clubs.admin_id = auth.uid()
    )
  );

CREATE POLICY "Club admins can delete gallery images"
  ON club_gallery FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = club_id AND clubs.admin_id = auth.uid()
    )
  );

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  date TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL DEFAULT '',
  banner_url TEXT DEFAULT '',
  is_grafest BOOLEAN DEFAULT false,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  max_attendees INTEGER,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'past')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- EVENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Event creators can view registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id AND events.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can register for events"
  ON event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unregister from events"
  ON event_registrations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- GRAFEST GALLERY
CREATE TABLE IF NOT EXISTS grafest_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  year INTEGER,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE grafest_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Grafest gallery is viewable by everyone"
  ON grafest_gallery FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Main admin can manage grafest gallery"
  ON grafest_gallery FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'main_admin'
    )
  );

CREATE POLICY "Main admin can delete grafest gallery"
  ON grafest_gallery FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'main_admin'
    )
  );

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_is_grafest ON events(is_grafest);
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_club_id ON events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_gallery_club_id ON club_gallery(club_id);
