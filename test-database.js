// Test Database Schema and Insertion
async function testDatabase() {
    console.log('🧪 Testing database schema and insertion...');
    
    if (!window.supabaseClient || !window.supabaseClient.isConfigured()) {
        console.log('❌ Supabase not configured');
        return;
    }
    
    const client = window.supabaseClient.getClient();
    
    // First, let's see what columns exist in lost_items table
    console.log('\n1. Testing table structure...');
    try {
        const { data, error } = await client
            .from('lost_items')
            .select('*')
            .limit(1);
            
        if (error) {
            console.log('❌ Error querying lost_items table:', error);
            
            // Try the original 'items' table
            console.log('🔄 Trying items table instead...');
            const { data: itemsData, error: itemsError } = await client
                .from('items')
                .select('*')
                .limit(1);
                
            if (itemsError) {
                console.log('❌ Items table also failed:', itemsError);
                return;
            } else {
                console.log('✅ Items table exists and works');
                console.log('Available columns:', itemsData.length > 0 ? Object.keys(itemsData[0]) : 'No data to check columns');
                
                // Update storage to use 'items' table instead
                console.log('💡 Consider updating storage.js to use "items" table');
                return;
            }
        } else {
            console.log('✅ lost_items table exists');
            console.log('Available columns:', data.length > 0 ? Object.keys(data[0]) : 'No data available');
        }
    } catch (error) {
        console.log('❌ Database connection error:', error);
        return;
    }
    
    // Test a simple insertion
    console.log('\n2. Testing simple insertion...');
    const testData = {
        type: 'lost',
        title: 'Test Item',
        category: 'electronics',
        location: 'Test Location',
        description: 'This is a test item for debugging',
        reporter_name: 'Test User',
        reporter_email: 'test@example.com'
    };
    
    console.log('Inserting test data:', testData);
    
    try {
        const { data, error } = await client
            .from('lost_items')
            .insert([testData])
            .select()
            .single();
            
        if (error) {
            console.log('❌ Insertion failed:', error);
            
            // Try with 'items' table
            console.log('🔄 Trying items table...');
            const { data: itemsData, error: itemsError } = await client
                .from('items')
                .insert([testData])
                .select()
                .single();
                
            if (itemsError) {
                console.log('❌ Items table insertion also failed:', itemsError);
            } else {
                console.log('✅ Items table insertion succeeded:', itemsData);
                console.log('💡 Your app should use "items" table, not "lost_items"');
            }
        } else {
            console.log('✅ Insertion successful:', data);
            
            // Clean up test data
            await client.from('lost_items').delete().eq('id', data.id);
            console.log('🧹 Test data cleaned up');
        }
    } catch (error) {
        console.log('❌ Insertion error:', error);
    }
}

// Make function available globally
window.testDatabase = testDatabase;

// Run test automatically
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testDatabase);
} else {
    testDatabase();
}