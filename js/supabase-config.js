// Supabase Configuration for Lost & Found Website

const SUPABASE_URL = 'https://fbdvjjkuchiiiwlnwavw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZHZqamt1Y2hpaWl3bG53YXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzcyMzMsImV4cCI6MjA3NTg1MzIzM30.e_kTbkW-G-xEfhS75zU-G3drXQpdKn7Tl3H8IWvcyJM';

// Initialize Supabase client
class SupabaseClient {
    constructor() {
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            console.error('⚠️  Please update your Supabase credentials in js/supabase-config.js');
            this.showSetupInstructions();
            return;
        }

        try {
            this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            this.isConnected = true;
            console.log('✅ Supabase client initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Supabase client:', error);
            this.isConnected = false;
        }
    }

    showSetupInstructions() {
        const instructions = `
        🚀 SUPABASE SETUP INSTRUCTIONS:

        1. Go to https://supabase.com and create a new project
        2. Go to Settings > API in your Supabase dashboard
        3. Copy your Project URL and anon/public key
        4. Replace the credentials in js/supabase-config.js:
           - SUPABASE_URL = 'your-project-url'
           - SUPABASE_ANON_KEY = 'your-anon-key'

        5. Create the items table by running this SQL in your Supabase SQL Editor:

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

        INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true);
        ALTER TABLE items ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON items FOR SELECT USING (true);
        CREATE POLICY "Allow public insert access" ON items FOR INSERT WITH CHECK (true);
        `;

        console.log(instructions);
    }

    isConfigured() {
        return this.isConnected;
    }

    getClient() {
        if (!this.isConnected) {
            throw new Error('Supabase client not configured. Please check your credentials.');
        }
        return this.client;
    }
}

// Create global Supabase instance
window.supabaseClient = new SupabaseClient();
