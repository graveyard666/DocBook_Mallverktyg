/*
# Create saved_messages table

1. New Tables
- `saved_messages`
  - `id` (uuid, primary key, generated automatically)
  - `name` (text, required) - the message name shown in the sidebar list
  - `xml` (text, required) - the full DocBook XML of the message
  - `created_at` (timestamptz, defaults to now)
  - `updated_at` (timestamptz, defaults to now)

2. Security
- Row Level Security is enabled on `saved_messages`.
- The app has no sign-in screen, so the anon and authenticated roles are granted SELECT, INSERT, UPDATE and DELETE.
- Policies allow those roles to access the table. This is intentional for this single-tenant tool, which has no user accounts.

3. Important notes
- No existing tables are changed.
- Anyone who can reach the app can read, change and delete saved messages. Add sign-in before storing sensitive data here.
*/

CREATE TABLE IF NOT EXISTS saved_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  xml text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saved_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON saved_messages TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_saved_messages" ON saved_messages;
CREATE POLICY "anon_select_saved_messages" ON saved_messages FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_saved_messages" ON saved_messages;
CREATE POLICY "anon_insert_saved_messages" ON saved_messages FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_saved_messages" ON saved_messages;
CREATE POLICY "anon_update_saved_messages" ON saved_messages FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_saved_messages" ON saved_messages;
CREATE POLICY "anon_delete_saved_messages" ON saved_messages FOR DELETE
TO anon, authenticated USING (true);
