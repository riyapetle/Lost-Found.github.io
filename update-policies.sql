-- Additional policies for UPDATE and DELETE operations
-- Run this in your Supabase SQL Editor to enable edit/delete functionality

-- Allow public update access to items
CREATE POLICY "Allow public update access" ON items
    FOR UPDATE USING (true);

-- Allow public delete access to items  
CREATE POLICY "Allow public delete access" ON items
    FOR DELETE USING (true);