// Supabase Database System for Lost & Found Website

class Storage {
    constructor() {
        this.supabase = null;
        this.isReady = false;
        this.initializeSupabase();
    }

    // Initialize Supabase connection
    async initializeSupabase() {
        try {
            if (supabaseClient && supabaseClient.isConfigured()) {
                this.supabase = supabaseClient.getClient();
                this.isReady = true;
                console.log('✅ Storage system connected to Supabase');
                
                // Set up real-time subscriptions
                this.setupRealTimeUpdates();
                
                // Check if we have any data, if not add sample data
                const { count } = await this.supabase.from('items').select('*', { count: 'exact', head: true });
                if (count === 0) {
                    await this.addSampleData();
                }
            } else {
                console.warn('Supabase not configured, using fallback mode');
                this.useFallbackMode();
            }
        } catch (error) {
            console.error('Failed to initialize Supabase storage:', error);
            this.useFallbackMode();
        }
    }

    // Fallback to localStorage if Supabase is not available
    useFallbackMode() {
        this.isReady = true;
        this.itemsKey = 'lostAndFoundItems';
        if (!this.getItemsFromLocalStorage().length) {
            this.addSampleDataToLocalStorage();
        }
    }

    // Add sample data for demonstration (Supabase version)
    async addSampleData() {
        if (!this.supabase) {
            return this.addSampleDataToLocalStorage();
        }

        const sampleItems = [
            {
                type: 'lost',
                title: 'iPhone 13 Pro',
                category: 'electronics',
                location: 'Central Park, NYC',
                description: 'Black iPhone 13 Pro with a cracked screen protector. Lost near the main fountain area.',
                image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
                reporter_name: 'Sarah Johnson',
                reporter_email: 'sarah.j@email.com',
                reporter_phone: '+1 (555) 123-4567',
                created_at: new Date('2024-01-10').toISOString()
            },
            {
                type: 'found',
                title: 'Brown Leather Wallet',
                category: 'accessories',
                location: 'Starbucks on 5th Avenue',
                description: 'Brown leather wallet found on a table. Contains various cards but no ID visible.',
                image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
                reporter_name: 'Mike Chen',
                reporter_email: 'mike.chen@email.com',
                reporter_phone: '+1 (555) 987-6543',
                created_at: new Date('2024-01-12').toISOString()
            },
            {
                type: 'lost',
                title: 'Silver MacBook Pro',
                category: 'electronics',
                location: 'NYU Library',
                description: 'Silver MacBook Pro 14-inch with stickers. Left in the study area on the 3rd floor.',
                image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
                reporter_name: 'Emily Davis',
                reporter_email: 'emily.davis@email.com',
                reporter_phone: '+1 (555) 456-7890',
                created_at: new Date('2024-01-08').toISOString()
            },
            {
                type: 'found',
                title: 'Red Backpack',
                category: 'bags',
                location: 'Bryant Park',
                description: 'Red hiking backpack found on a bench. Contains some books and a water bottle.',
                image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
                reporter_name: 'Alex Rodriguez',
                reporter_email: 'alex.r@email.com',
                reporter_phone: '+1 (555) 321-9876',
                created_at: new Date('2024-01-11').toISOString()
            },
            {
                type: 'lost',
                title: 'Gold Wedding Ring',
                category: 'accessories',
                location: 'Brooklyn Bridge',
                description: 'Gold wedding ring with small diamond. Lost while taking photos on the bridge.',
                image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop',
                reporter_name: 'Jennifer White',
                reporter_email: 'jennifer.white@email.com',
                reporter_phone: '+1 (555) 555-1234',
                created_at: new Date('2024-01-09').toISOString()
            },
            {
                type: 'found',
                title: 'Blue Baseball Cap',
                category: 'clothing',
                location: 'Times Square',
                description: 'Blue Yankees baseball cap found near the TKTS stairs.',
                image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=300&fit=crop',
                reporter_name: 'David Kim',
                reporter_email: 'david.kim@email.com',
                reporter_phone: '+1 (555) 777-8888',
                created_at: new Date('2024-01-13').toISOString()
            }
        ];

        try {
            const { error } = await this.supabase.from('items').insert(sampleItems);
            if (error) {
                console.error('Error adding sample data:', error);
            } else {
                console.log('✅ Sample data added to Supabase');
            }
        } catch (error) {
            console.error('Failed to add sample data:', error);
        }
    }

    // Add sample data to localStorage (fallback)
    addSampleDataToLocalStorage() {
        const sampleItems = [
            {
                id: this.generateId(),
                type: 'lost',
                title: 'iPhone 13 Pro',
                category: 'electronics',
                location: 'Central Park, NYC',
                description: 'Black iPhone 13 Pro with a cracked screen protector. Lost near the main fountain area.',
                image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
                reporterName: 'Sarah Johnson',
                reporterEmail: 'sarah.j@email.com',
                reporterPhone: '+1 (555) 123-4567',
                dateReported: new Date('2024-01-10').toISOString()
            },
            {
                id: this.generateId(),
                type: 'found',
                title: 'Brown Leather Wallet',
                category: 'accessories',
                location: 'Starbucks on 5th Avenue',
                description: 'Brown leather wallet found on a table. Contains various cards but no ID visible.',
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
                reporterName: 'Mike Chen',
                reporterEmail: 'mike.chen@email.com',
                reporterPhone: '+1 (555) 987-6543',
                dateReported: new Date('2024-01-12').toISOString()
            }
        ];

        this.saveItemsToLocalStorage(sampleItems);
    }

    // Generate unique ID for items
    generateId() {
        return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Generate unique ID for users
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get all items from Supabase or localStorage
    async getItems() {
        // Wait for initialization with timeout
        if (!this.isReady) {
            await new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 50; // 5 seconds timeout
                
                const checkReady = () => {
                    if (this.isReady) {
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        console.warn('Storage initialization timeout, falling back to localStorage');
                        this.useFallbackMode();
                        resolve();
                    } else {
                        attempts++;
                        setTimeout(checkReady, 100);
                    }
                };
                checkReady();
            });
        }

        if (this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('items')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) {
                    console.error('Error getting items from Supabase:', error);
                    return [];
                }
                
                return this.transformSupabaseItems(data || []);
            } catch (error) {
                console.error('Error fetching items:', error);
                return [];
            }
        } else {
            return this.getItemsFromLocalStorage();
        }
    }

    // Get items from localStorage (fallback)
    getItemsFromLocalStorage() {
        try {
            const items = localStorage.getItem(this.itemsKey);
            return items ? JSON.parse(items) : [];
        } catch (error) {
            console.error('Error getting items from localStorage:', error);
            return [];
        }
    }

    // Save items to localStorage (fallback)
    saveItemsToLocalStorage(items) {
        try {
            localStorage.setItem(this.itemsKey, JSON.stringify(items));
            return true;
        } catch (error) {
            console.error('Error saving items to localStorage:', error);
            return false;
        }
    }

    // Transform Supabase items to match the expected format
    transformSupabaseItems(supabaseItems) {
        console.log('🔄 Transforming Supabase items:', supabaseItems);
        
        if (!Array.isArray(supabaseItems)) {
            console.warn('⚠️ Expected array but got:', typeof supabaseItems, supabaseItems);
            return [];
        }
        
        const transformed = supabaseItems.map((item, index) => {
            console.log(`🔄 Transforming item ${index + 1}:`, item);
            
            const transformedItem = {
                id: item.id,
                type: item.type,
                title: item.title,
                category: item.category,
                location: item.location,
                description: item.description,
                image: item.image_url,
                reporterName: item.reporter_name,
                reporterEmail: item.reporter_email,
                reporterPhone: item.reporter_phone,
                dateReported: item.created_at,
                dateLost: item.date_lost,
                dateFound: item.date_found,
                currentLocation: item.current_location,
                verificationQuestions: item.verification_questions,
                availability: item.availability,
                reward: item.reward
            };
            
            console.log(`✅ Transformed item ${index + 1}:`, transformedItem);
            return transformedItem;
        });
        
        console.log('🎉 All items transformed:', transformed);
        return transformed;
    }

    // Add new item to Supabase or localStorage
    async addItem(itemData) {
        console.log('💾 Storage.addItem called with:', itemData);
        console.log('🔌 Supabase available:', !!this.supabase);
        
        if (this.supabase) {
            try {
                // Transform the data to match Supabase schema
                const supabaseData = {
                    type: itemData.type,
                    title: itemData.title,
                    category: itemData.category,
                    location: itemData.location,
                    description: itemData.description,
                    image_url: itemData.image || null,
                    reporter_name: itemData.reporterName,
                    reporter_email: itemData.reporterEmail,
                    reporter_phone: itemData.reporterPhone || null,
                    date_lost: itemData.dateLost || null,
                    date_found: itemData.dateFound || null,
                    current_location: itemData.currentLocation || null,
                    verification_questions: itemData.verificationQuestions || null,
                    availability: itemData.availability || null,
                    reward: itemData.reward || null
                };
                
                console.log('🔄 Transformed data for Supabase:', supabaseData);

                const { data, error } = await this.supabase
                    .from('items')
                    .insert([supabaseData])
                    .select()
                    .single();

                if (error) {
                    console.error('❌ Error adding item to Supabase:', error);
                    return null;
                }
                
                console.log('✅ Item added to Supabase successfully:', data);
                const transformedItem = this.transformSupabaseItems([data])[0];
                console.log('🔄 Transformed result:', transformedItem);

                return transformedItem;
            } catch (error) {
                console.error('❌ Failed to add item to Supabase:', error);
                console.log('🔄 Falling back to localStorage...');
                
                // Fallback to localStorage on error
                const items = this.getItemsFromLocalStorage();
                const newItem = {
                    id: this.generateId(),
                    ...itemData,
                    dateReported: new Date().toISOString()
                };
                items.unshift(newItem);
                const success = this.saveItemsToLocalStorage(items);
                console.log('💾 localStorage fallback result:', success);
                return success ? newItem : null;
            }
        } else {
            // Fallback to localStorage
            console.log('💾 Using localStorage (no Supabase available)');
            const items = this.getItemsFromLocalStorage();
            const newItem = {
                id: this.generateId(),
                ...itemData,
                dateReported: new Date().toISOString()
            };
            items.unshift(newItem);
            const success = this.saveItemsToLocalStorage(items);
            console.log('💾 localStorage save result:', success);
            return success ? newItem : null;
        }
    }

    // Get single item by ID
    async getItemById(id) {
        if (this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('items')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) {
                    console.error('Error getting item by ID:', error);
                    return null;
                }
                
                return this.transformSupabaseItems([data])[0];
            } catch (error) {
                console.error('Failed to get item by ID:', error);
                return null;
            }
        } else {
            const items = this.getItemsFromLocalStorage();
            return items.find(item => item.id === id);
        }
    }

    // Update item
    async updateItem(id, updates) {
        if (this.supabase) {
            try {
                // Transform updates to match Supabase schema
                const supabaseUpdates = {
                    title: updates.title,
                    category: updates.category,
                    location: updates.location,
                    description: updates.description,
                    image_url: updates.image || null,
                    reporter_name: updates.reporterName,
                    reporter_email: updates.reporterEmail,
                    reporter_phone: updates.reporterPhone || null,
                    date_lost: updates.dateLost || null,
                    date_found: updates.dateFound || null,
                    current_location: updates.currentLocation || null,
                    verification_questions: updates.verificationQuestions || null,
                    availability: updates.availability || null,
                    reward: updates.reward || null,
                    updated_at: new Date().toISOString()
                };

                // Remove undefined values
                Object.keys(supabaseUpdates).forEach(key => {
                    if (supabaseUpdates[key] === undefined) {
                        delete supabaseUpdates[key];
                    }
                });

                const { data, error } = await this.supabase
                    .from('items')
                    .update(supabaseUpdates)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) {
                    console.error('Error updating item:', error);
                    return null;
                }

                return this.transformSupabaseItems([data])[0];
            } catch (error) {
                console.error('Failed to update item:', error);
                return null;
            }
        } else {
            const items = this.getItemsFromLocalStorage();
            const index = items.findIndex(item => item.id === id);
            if (index !== -1) {
                items[index] = { ...items[index], ...updates };
                return this.saveItemsToLocalStorage(items) ? items[index] : null;
            }
            return null;
        }
    }

    // Delete item
    async deleteItem(id) {
        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from('items')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error('Error deleting item:', error);
                    return false;
                }

                return true;
            } catch (error) {
                console.error('Failed to delete item:', error);
                return false;
            }
        } else {
            const items = this.getItemsFromLocalStorage();
            const filteredItems = items.filter(item => item.id !== id);
            return this.saveItemsToLocalStorage(filteredItems);
        }
    }

    // Search and filter items
    async searchItems(query = '', filters = {}) {
        const items = await this.getItems();
        let filteredItems = [...items];

        // Text search
        if (query.trim()) {
            const searchTerm = query.toLowerCase();
            filteredItems = filteredItems.filter(item =>
                item.title.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                item.location.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm)
            );
        }

        // Type filter (lost/found)
        if (filters.type && filters.type !== 'all') {
            filteredItems = filteredItems.filter(item => item.type === filters.type);
        }

        // Category filter
        if (filters.category && filters.category !== 'all') {
            filteredItems = filteredItems.filter(item => item.category === filters.category);
        }

        // Location filter
        if (filters.location && filters.location.trim()) {
            const locationTerm = filters.location.toLowerCase();
            filteredItems = filteredItems.filter(item =>
                item.location.toLowerCase().includes(locationTerm)
            );
        }

        // Sort by date (newest first)
        filteredItems.sort((a, b) => new Date(b.dateReported) - new Date(a.dateReported));

        return filteredItems;
    }

    // Set up real-time updates for Supabase
    setupRealTimeUpdates() {
        // Temporarily disabled to avoid WebSocket connection issues
        console.log('ℹ️ Real-time updates disabled (WebSocket issues)');
        return;
        
        if (!this.supabase) return;

        try {
            // Subscribe to changes in the items table
            this.supabase
                .channel('items-channel')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'items'
                }, (payload) => {
                    console.log('Real-time update:', payload);
                    // Dispatch custom event for real-time updates
                    const event = new CustomEvent('itemsUpdated', {
                        detail: { payload, type: payload.eventType }
                    });
                    window.dispatchEvent(event);
                })
                .subscribe();

            console.log('✅ Real-time subscriptions set up');
        } catch (error) {
            console.error('Failed to set up real-time updates:', error);
        }
    }

    // Upload image to Supabase Storage
    async uploadImage(file, fileName) {
        if (!this.supabase) {
            console.warn('Supabase not available, using data URL');
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }

        try {
            const fileExt = fileName.split('.').pop();
            const timestamp = Date.now();
            const uniqueFileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { data, error } = await this.supabase.storage
                .from('item-images')
                .upload(uniqueFileName, file);

            if (error) {
                console.error('Error uploading image:', error);
                return null;
            }

            // Get public URL
            const { data: { publicUrl } } = this.supabase.storage
                .from('item-images')
                .getPublicUrl(uniqueFileName);

            return publicUrl;
        } catch (error) {
            console.error('Failed to upload image:', error);
            return null;
        }
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    }

    // Clear all data (for development/testing)
    clearAllData() {
        localStorage.removeItem(this.itemsKey);
        localStorage.removeItem(this.usersKey);
        localStorage.removeItem(this.currentUserKey);
        this.initializeData();
    }

    // Export data (for backup)
    exportData() {
        return {
            items: this.getItems(),
            users: this.getUsers(),
            exportDate: new Date().toISOString()
        };
    }

    // Import data (for backup restore)
    importData(data) {
        try {
            if (data.items) {
                this.saveItems(data.items);
            }
            if (data.users) {
                this.saveUsers(data.users);
            }
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Create global storage instance
window.storage = new Storage();