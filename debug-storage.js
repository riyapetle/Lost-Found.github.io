// Debug Script for Lost & Found Storage Issues
// Run this in browser console to diagnose problems

async function debugStorage() {
    console.log('🔍 Starting storage debug...');
    console.log('='.repeat(50));

    // Check if Supabase is configured
    console.log('1. Checking Supabase configuration...');
    try {
        if (window.supabaseClient && window.supabaseClient.isConfigured()) {
            console.log('✅ Supabase client is configured');
            const client = window.supabaseClient.getClient();
            console.log('✅ Supabase client retrieved successfully');
        } else {
            console.log('❌ Supabase client is not configured');
            return;
        }
    } catch (error) {
        console.log('❌ Error with Supabase client:', error);
        return;
    }

    // Check storage instance
    console.log('\n2. Checking storage instance...');
    if (window.storage) {
        console.log('✅ Storage instance exists');
        console.log('Storage ready:', window.storage.isReady);
        console.log('Storage has Supabase:', !!window.storage.supabase);
    } else {
        console.log('❌ Storage instance not found');
        return;
    }

    // Test direct Supabase connection
    console.log('\n3. Testing direct Supabase connection...');
    try {
        const client = window.supabaseClient.getClient();
        const { data, error, count } = await client
            .from('items')
            .select('*', { count: 'exact' });
        
        if (error) {
            console.log('❌ Error fetching from Supabase:', error);
        } else {
            console.log('✅ Direct Supabase fetch successful');
            console.log(`Found ${count} items in database`);
            console.log('Sample data:', data?.slice(0, 2));
        }
    } catch (error) {
        console.log('❌ Direct Supabase connection failed:', error);
    }

    // Test storage.getItems()
    console.log('\n4. Testing storage.getItems()...');
    try {
        const items = await window.storage.getItems();
        console.log('✅ storage.getItems() successful');
        console.log(`Retrieved ${items.length} items`);
        console.log('Sample items:', items.slice(0, 2));
        
        // Check data format
        if (items.length > 0) {
            const sampleItem = items[0];
            console.log('\n5. Checking data format...');
            const requiredFields = ['id', 'type', 'title', 'category', 'location', 'description', 'reporterName', 'reporterEmail'];
            const hasAllFields = requiredFields.every(field => field in sampleItem);
            
            if (hasAllFields) {
                console.log('✅ Data format is correct');
            } else {
                console.log('❌ Data format issue - missing fields:');
                requiredFields.forEach(field => {
                    if (!(field in sampleItem)) {
                        console.log(`  - Missing: ${field}`);
                    }
                });
            }
            
            console.log('Sample item structure:', Object.keys(sampleItem));
        }
        
        return items;
    } catch (error) {
        console.log('❌ storage.getItems() failed:', error);
    }

    console.log('\n6. Testing search functionality...');
    try {
        const searchResults = await window.storage.searchItems('', {});
        console.log('✅ Search function works');
        console.log(`Search returned ${searchResults.length} items`);
    } catch (error) {
        console.log('❌ Search function failed:', error);
    }

    console.log('\n='.repeat(50));
    console.log('🎯 Debug complete. Check results above.');
}

// Auto-run debug when script loads
debugStorage();

// Export function to global scope for manual testing
window.debugStorage = debugStorage;