-- Lost & Found Website - Supabase Database Setup
-- Run this script in your Supabase SQL Editor

-- Create items table
CREATE TABLE items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('lost', 'found')),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    reporter_name VARCHAR(255) NOT NULL,
    reporter_email VARCHAR(255) NOT NULL,
    reporter_phone VARCHAR(20),
    date_lost DATE,
    date_found DATE,
    current_location VARCHAR(255),
    verification_questions TEXT,
    availability TEXT,
    reward TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true);

-- Set up RLS (Row Level Security) policies
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to items
CREATE POLICY "Allow public read access" ON items
    FOR SELECT USING (true);

-- Allow public insert access to items
CREATE POLICY "Allow public insert access" ON items
    FOR INSERT WITH CHECK (true);

-- Allow public update access to items
CREATE POLICY "Allow public update access" ON items
    FOR UPDATE USING (true);

-- Allow public delete access to items
CREATE POLICY "Allow public delete access" ON items
    FOR DELETE USING (true);

-- Create storage policy for image uploads
CREATE POLICY "Allow public image uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'item-images');

-- Create storage policy for image access
CREATE POLICY "Allow public image access" ON storage.objects
    FOR SELECT USING (bucket_id = 'item-images');

-- Create an index for better performance on queries
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_category ON items(category);

-- Add a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional - the app will add this automatically if empty)
INSERT INTO items (type, title, category, location, description, image_url, reporter_name, reporter_email, reporter_phone, created_at) VALUES
('lost', 'iPhone 13 Pro', 'electronics', 'Central Park, NYC', 'Black iPhone 13 Pro with a cracked screen protector. Lost near the main fountain area.', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop', 'Sarah Johnson', 'sarah.j@email.com', '+1 (555) 123-4567', '2024-01-10T10:00:00Z'),
('found', 'Brown Leather Wallet', 'accessories', 'Starbucks on 5th Avenue', 'Brown leather wallet found on a table. Contains various cards but no ID visible.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', 'Mike Chen', 'mike.chen@email.com', '+1 (555) 987-6543', '2024-01-12T14:30:00Z'),
('lost', 'Silver MacBook Pro', 'electronics', 'NYU Library', 'Silver MacBook Pro 14-inch with stickers. Left in the study area on the 3rd floor.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop', 'Emily Davis', 'emily.davis@email.com', '+1 (555) 456-7890', '2024-01-08T16:45:00Z'),
('found', 'Red Backpack', 'bags', 'Bryant Park', 'Red hiking backpack found on a bench. Contains some books and a water bottle.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', 'Alex Rodriguez', 'alex.r@email.com', '+1 (555) 321-9876', '2024-01-11T12:15:00Z'),
('lost', 'Gold Wedding Ring', 'accessories', 'Brooklyn Bridge', 'Gold wedding ring with small diamond. Lost while taking photos on the bridge.', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop', 'Jennifer White', 'jennifer.white@email.com', '+1 (555) 555-1234', '2024-01-09T18:20:00Z'),
('found', 'Blue Baseball Cap', 'clothing', 'Times Square', 'Blue Yankees baseball cap found near the TKTS stairs.', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=300&fit=crop', 'David Kim', 'david.kim@email.com', '+1 (555) 777-8888', '2024-01-13T11:30:00Z');