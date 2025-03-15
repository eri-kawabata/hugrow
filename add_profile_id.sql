ALTER TABLE works ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id);
