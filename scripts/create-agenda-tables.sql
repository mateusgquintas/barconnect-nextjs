-- Agenda schema: rooms and bookings
-- Run this in your Supabase SQL Editor to create the tables

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  capacity INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  start TIMESTAMPTZ NOT NULL,
  "end" TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out')),
  customer_name TEXT,
  pilgrimage_id UUID, -- Optional reference to pilgrimages table (if exists)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (start < "end")
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start ON bookings(start);
CREATE INDEX IF NOT EXISTS idx_bookings_end ON bookings("end");
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON bookings(start, "end");

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust based on your auth requirements)
-- Allow authenticated users to read rooms
CREATE POLICY "Allow authenticated read rooms" ON rooms
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to read bookings
CREATE POLICY "Allow authenticated read bookings" ON bookings
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert bookings
CREATE POLICY "Allow authenticated insert bookings" ON bookings
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update their bookings
CREATE POLICY "Allow authenticated update bookings" ON bookings
  FOR UPDATE TO authenticated USING (true);

-- Insert some sample rooms (optional)
INSERT INTO rooms (name, capacity, status) VALUES
  ('Quarto 101', 2, 'active'),
  ('Quarto 102', 2, 'active'),
  ('Quarto 201', 4, 'active'),
  ('Dormitório A', 10, 'active')
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE rooms IS 'Hotel rooms available for booking';
COMMENT ON TABLE bookings IS 'Room reservations with date ranges';
COMMENT ON COLUMN bookings."end" IS 'Exclusive end datetime (half-open interval)';
