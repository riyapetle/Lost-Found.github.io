# Lost & Found Website with Supabase

A modern, responsive lost and found website built with HTML, CSS, JavaScript, and Supabase as the backend.

## Features

- 🏠 **Home Page** - Browse all lost & found items in a clean card grid
- 🔍 **Search & Filter** - Search by item name, category, or location
- 📝 **Report Items** - Easy forms to report lost or found items
- 📷 **Image Upload** - Upload photos to Supabase storage
- 💬 **Item Details** - Detailed modal view with contact information
- 📞 **Contact Owner** - Built-in contact form to reach item reporters
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Real-time Updates** - Live updates when new items are added
- 🎨 **Modern UI** - Beautiful animations and hover effects

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Click "New Project" and set up your project
3. Wait for the project to be initialized (~2 minutes)

### 2. Get Your Credentials

1. In your Supabase dashboard, go to **Settings > API**
2. Copy your **Project URL** 
3. Copy your **anon/public key**

### 3. Configure the Website

1. Open `js/supabase-config.js` in your code editor
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'your-project-url-here';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

### 4. Set Up Database

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the following SQL to create the items table:

```sql
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

-- Allow public read access
CREATE POLICY "Allow public read access" ON items
    FOR SELECT USING (true);

-- Allow public insert access  
CREATE POLICY "Allow public insert access" ON items
    FOR INSERT WITH CHECK (true);

-- Create storage policy for images
CREATE POLICY "Allow public image uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "Allow public image access" ON storage.objects
    FOR SELECT USING (bucket_id = 'item-images');
```

### 5. Enable Real-time (Optional)

1. Go to **Database > Replication** in your Supabase dashboard
2. Enable replication for the `items` table
3. This allows real-time updates when items are added

### 6. Run the Website

1. Open `index.html` in your web browser
2. The website will automatically connect to Supabase
3. Sample data will be loaded on first visit

## File Structure

```
lost-and-found/
├── index.html              # Home page
├── report-lost.html         # Report lost item form
├── report-found.html        # Report found item form
├── README.md               # This file
├── css/
│   └── style.css           # Main stylesheet
├── js/
│   ├── supabase-config.js  # Supabase configuration
│   ├── storage.js          # Database operations
│   ├── main.js            # Home page functionality
│   └── report.js          # Form handling
└── images/                # Local images folder
```

## How to Use

1. **Browse Items**: Visit the home page to see all lost and found items
2. **Search**: Use the search bar and filters to find specific items
3. **View Details**: Click any item card to see full details and contact info
4. **Report Lost Item**: Use the "Report Lost" page to add a lost item
5. **Report Found Item**: Use the "Report Found" page to add a found item
6. **Contact Owners**: Click "Contact Owner" in item details to send a message

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL database)
- **Storage**: Supabase Storage for images
- **Real-time**: Supabase Real-time subscriptions
- **Icons**: Font Awesome 6
- **Deployment**: Can be deployed anywhere (Vercel, Netlify, etc.)

## Troubleshooting

### Website shows setup modal
- Make sure you've updated the credentials in `js/supabase-config.js`
- Check that your Supabase project is active

### Items not loading
- Check the browser console for errors
- Ensure the database table was created correctly
- Verify your RLS policies are set up

### Images not uploading
- Make sure the storage bucket was created
- Check that storage policies are configured
- Verify file size is under 5MB

### Real-time updates not working
- Enable replication for the `items` table in Supabase dashboard
- Check browser console for subscription errors

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase setup following the instructions above
3. Make sure all SQL commands were executed successfully

## License

This project is open source and available under the [MIT License](LICENSE).