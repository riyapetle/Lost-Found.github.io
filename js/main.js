// Main JavaScript for Lost & Found Website

class LostAndFoundApp {
    constructor() {
        this.currentItems = [];
        this.filteredItems = [];
        this.currentItemModal = null;
    }

    async init() {
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupRealTimeUpdates();
        await this.loadItems();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        }

        // Filter functionality
        const typeFilter = document.getElementById('typeFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const locationFilter = document.getElementById('locationFilter');

        if (typeFilter) typeFilter.addEventListener('change', this.handleFilter.bind(this));
        if (categoryFilter) categoryFilter.addEventListener('change', this.handleFilter.bind(this));
        if (locationFilter) locationFilter.addEventListener('input', this.debounce(this.handleFilter.bind(this), 300));

        // Modal functionality
        window.addEventListener('click', this.handleModalClick.bind(this));

        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactSubmit.bind(this));
        }

        // Edit form
        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.addEventListener('submit', this.handleEditSubmit.bind(this));
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }

    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });

            // Close menu when clicking a link
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                });
            });
        }
    }

    // Set up real-time updates
    setupRealTimeUpdates() {
        // Listen for Supabase real-time updates
        window.addEventListener('itemsUpdated', (event) => {
            console.log('Received real-time update:', event.detail);
            // Refresh the items when data changes
            this.loadItems();
        });
    }

    // Load and display items
    async loadItems() {
        const loadingElement = document.getElementById('loading');
        const noItemsElement = document.getElementById('noItems');
        const itemsGrid = document.getElementById('itemsGrid');
        
        try {
            // Show loading state
            if (loadingElement) loadingElement.style.display = 'block';
            if (noItemsElement) noItemsElement.style.display = 'none';
            if (itemsGrid) itemsGrid.innerHTML = '';
            
            // Wait for storage to be ready
            console.log('💡 Waiting for storage to initialize...');
            let attempts = 0;
            const maxAttempts = 100; // 10 seconds
            
            while (!window.storage?.isReady && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.storage?.isReady) {
                console.warn('⚠️ Storage initialization timeout');
                this.showErrorState('Storage system not ready. Please refresh the page.');
                return;
            }
            
            console.log('✅ Storage ready, loading items...');
            
            // Load items from storage
            this.currentItems = await storage.getItems();
            console.log(`📦 Loaded ${this.currentItems.length} items from storage`);
            
            this.filteredItems = [...this.currentItems];
            
            // Hide loading and render items
            this.hideLoading();
            this.renderItems();
            this.updateSummary();
            
        } catch (error) {
            console.error('Error loading items:', error);
            this.hideLoading();
            this.showErrorState('Failed to load items. Please refresh the page.');
        }
    }

    // Render items in the grid
    renderItems() {
        console.log('🎨 renderItems called with', this.filteredItems.length, 'items');
        
        const itemsGrid = document.getElementById('itemsGrid');
        const itemsCount = document.getElementById('itemsCount');
        const noItems = document.getElementById('noItems');

        if (!itemsGrid) {
            console.log('❌ itemsGrid element not found');
            return;
        }

        // Update count
        if (itemsCount) {
            itemsCount.textContent = this.filteredItems.length;
        }

        // Clear grid
        itemsGrid.innerHTML = '';
        console.log('🧹 Grid cleared');

        if (this.filteredItems.length === 0) {
            if (noItems) noItems.style.display = 'block';
            return;
        }

        if (noItems) noItems.style.display = 'none';

        // Create item cards
        console.log('🃏 Creating item cards...');
        this.filteredItems.forEach((item, index) => {
            console.log(`Creating card ${index + 1}:`, item.title);
            const itemCard = this.createItemCard(item);
            itemsGrid.appendChild(itemCard);
        });
        console.log('✅ All cards created and added to grid');

        // Add animation to cards
        this.animateCards();
        
        // Update summary after rendering
        this.updateSummary();
    }

    // Create individual item card
    createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.setAttribute('data-item-id', item.id);
        card.onclick = () => this.showItemModal(item);

        const imageUrl = item.image || 'https://via.placeholder.com/400x300?text=No+Image';
        const formattedDate = storage.formatDate(item.dateReported);

        card.innerHTML = `
            <div class="item-image">
                <img src="${imageUrl}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                <span class="item-status ${item.type}">${item.type}</span>
            </div>
            <div class="item-content">
                <h3>${this.escapeHtml(item.title)}</h3>
                <div class="item-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(item.location)}</span>
                    <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                </div>
                <p class="item-description">${this.escapeHtml(item.description)}</p>
                <div class="item-reporter">
                    <i class="fas fa-user"></i> ${this.escapeHtml(item.reporterName)}
                </div>
            </div>
        `;

        return card;
    }

    // Show item details modal
    showItemModal(item) {
        this.currentItemModal = item;
        const modal = document.getElementById('itemModal');
        
        // Populate modal with item data
        document.getElementById('modalTitle').textContent = 'Item Details';
        document.getElementById('modalImage').src = item.image || 'https://via.placeholder.com/400x300?text=No+Image';
        document.getElementById('modalStatus').textContent = item.type;
        document.getElementById('modalStatus').className = `item-status ${item.type}`;
        document.getElementById('modalDate').textContent = storage.formatDate(item.dateReported);
        document.getElementById('modalItemName').textContent = item.title;
        document.getElementById('modalCategory').textContent = item.category.charAt(0).toUpperCase() + item.category.slice(1);
        document.getElementById('modalLocation').textContent = item.location;
        document.getElementById('modalDescription').textContent = item.description;
        document.getElementById('modalReporter').textContent = item.reporterName;
        document.getElementById('modalEmail').textContent = item.reporterEmail;
        document.getElementById('modalPhone').textContent = item.reporterPhone || 'Not provided';

        modal.style.display = 'block';
    }

    // Handle search input
    handleSearch() {
        this.applyFilters();
    }

    // Handle filter changes
    handleFilter() {
        this.applyFilters();
    }

    // Apply all filters and search
    async applyFilters() {
        const searchQuery = document.getElementById('searchInput')?.value || '';
        const typeFilter = document.getElementById('typeFilter')?.value || 'all';
        const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
        const locationFilter = document.getElementById('locationFilter')?.value || '';

        const filters = {
            type: typeFilter,
            category: categoryFilter,
            location: locationFilter
        };

        console.log('🔍 Applying filters:', { searchQuery, filters });
        console.log('📊 Current items count:', this.currentItems.length);

        try {
            this.filteredItems = await storage.searchItems(searchQuery, filters);
            console.log('✅ Filter results:', this.filteredItems.length, 'items');
            this.renderItems();
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }

    // Clear all filters
    async clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('typeFilter').value = 'all';
        document.getElementById('categoryFilter').value = 'all';
        document.getElementById('locationFilter').value = '';
        
        this.filteredItems = [...this.currentItems];
        this.renderItems();
    }

    // Handle modal clicks (for closing)
    handleModalClick(event) {
        const itemModal = document.getElementById('itemModal');
        const authModal = document.getElementById('authModal');
        const contactModal = document.getElementById('contactModal');

        if (event.target === itemModal) {
            this.closeModal();
        }
        if (event.target === contactModal) {
            this.closeContactModal();
        }
    }

    // Handle keyboard shortcuts
    handleKeyboard(event) {
        // Close modals with Escape key
        if (event.key === 'Escape') {
            this.closeModal();
            this.closeContactModal();
        }

        // Focus search with Ctrl+F or Cmd+F
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            event.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    }

    // Close item details modal
    closeModal() {
        const modal = document.getElementById('itemModal');
        modal.style.display = 'none';
        this.currentItemModal = null;
    }

    // Show contact owner modal
    contactOwner() {
        if (!this.currentItemModal) return;

        const modal = document.getElementById('contactModal');
        const subjectField = document.getElementById('contactSubject');
        const messageField = document.getElementById('contactMessage');

        // Pre-fill subject
        const itemType = this.currentItemModal.type === 'lost' ? 'Lost' : 'Found';
        subjectField.value = `Regarding ${itemType} Item: ${this.currentItemModal.title}`;

        // Pre-fill message
        messageField.value = `Hi ${this.currentItemModal.reporterName},\n\nI saw your listing about the ${this.currentItemModal.title}. `;


        modal.style.display = 'block';
    }

    // Handle contact form submission
    handleContactSubmit(event) {
        event.preventDefault();
        
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value;
        const senderEmail = document.getElementById('contactEmail').value;

        if (!subject || !message || !senderEmail) {
            alert('Please fill in all fields');
            return;
        }

        // In a real application, this would send an email
        // For demo purposes, we'll show a success message
        this.showSuccessMessage('Message sent successfully! The owner will be notified.');
        this.closeContactModal();
        
        // Reset form
        document.getElementById('contactForm').reset();
    }

    // Close contact modal
    closeContactModal() {
        const modal = document.getElementById('contactModal');
        modal.style.display = 'none';
    }

    // Show success message
    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Hide loading spinner
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    // Animate cards on load
    animateCards() {
        const cards = document.querySelectorAll('.item-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }

    // Utility function: Debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Utility function: Escape HTML
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Refresh items (useful when returning from other pages)
    async refresh() {
        await this.loadItems();
    }

    // Update summary statistics
    updateSummary() {
        const stats = this.getStats();
        const itemsCountElement = document.getElementById('itemsCount');
        
        if (itemsCountElement) {
            itemsCountElement.textContent = this.filteredItems.length;
        }
        
        // Update or create summary cards if they exist
        this.updateSummaryCards(stats);
    }
    
    // Update summary cards with statistics
    updateSummaryCards(stats) {
        // Check if we have a summary section to update
        const summarySection = document.querySelector('.summary-section');
        if (summarySection) {
            const totalCard = summarySection.querySelector('.stat-total');
            const lostCard = summarySection.querySelector('.stat-lost');
            const foundCard = summarySection.querySelector('.stat-found');
            const recentCard = summarySection.querySelector('.stat-recent');
            
            // Animate numbers counting up
            if (totalCard) this.animateNumber(totalCard, stats.total);
            if (lostCard) this.animateNumber(lostCard, stats.lost);
            if (foundCard) this.animateNumber(foundCard, stats.found);
            if (recentCard) this.animateNumber(recentCard, stats.recent);
        }
    }
    
    // Animate number counting up
    animateNumber(element, targetNumber) {
        const currentNumber = parseInt(element.textContent) || 0;
        if (currentNumber === targetNumber) return;
        
        const duration = 800; // 0.8 seconds
        const increment = targetNumber > currentNumber ? 1 : -1;
        const stepTime = Math.abs(duration / (targetNumber - currentNumber));
        
        let current = currentNumber;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            
            if (current === targetNumber) {
                clearInterval(timer);
                // Add a little bounce effect
                element.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        }, stepTime);
    }
    
    // Show error state
    showErrorState(message) {
        const itemsGrid = document.getElementById('itemsGrid');
        const noItems = document.getElementById('noItems');
        
        if (itemsGrid) {
            itemsGrid.innerHTML = `
                <div class="error-state" style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 3rem;
                    color: #ef4444;
                    background: #fef2f2;
                    border-radius: 15px;
                    border: 2px solid #fecaca;
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Oops! Something went wrong</h3>
                    <p>${message}</p>
                    <button onclick="app.loadItems()" class="btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-refresh"></i> Try Again
                    </button>
                </div>
            `;
        }
        
        if (noItems) noItems.style.display = 'none';
    }

    // Get statistics
    getStats() {
        const items = this.currentItems;
        const now = new Date();
        
        return {
            total: items.length,
            lost: items.filter(item => item.type === 'lost').length,
            found: items.filter(item => item.type === 'found').length,
            recent: items.filter(item => {
                const reportDate = new Date(item.dateReported);
                const daysSinceReport = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));
                return daysSinceReport <= 7;
            }).length
        };
    }

    // Edit item functionality
    editItem() {
        if (!this.currentItemModal) return;
        
        const editModal = document.getElementById('editModal');
        const item = this.currentItemModal;
        
        // Pre-fill the edit form with current data
        document.getElementById('editTitle').value = item.title;
        document.getElementById('editCategory').value = item.category;
        document.getElementById('editLocation').value = item.location;
        document.getElementById('editDescription').value = item.description;
        document.getElementById('editReporterName').value = item.reporterName;
        document.getElementById('editReporterEmail').value = item.reporterEmail;
        document.getElementById('editReporterPhone').value = item.reporterPhone || '';
        
        // Close item modal and show edit modal
        this.closeModal();
        editModal.style.display = 'block';
    }

    // Close edit modal
    closeEditModal() {
        const editModal = document.getElementById('editModal');
        editModal.style.display = 'none';
        document.getElementById('editForm').reset();
    }

    // Handle edit form submission
    async handleEditSubmit(event) {
        event.preventDefault();
        
        if (!this.currentItemModal) return;
        
        const updates = {
            title: document.getElementById('editTitle').value.trim(),
            category: document.getElementById('editCategory').value,
            location: document.getElementById('editLocation').value.trim(),
            description: document.getElementById('editDescription').value.trim(),
            reporterName: document.getElementById('editReporterName').value.trim(),
            reporterEmail: document.getElementById('editReporterEmail').value.trim(),
            reporterPhone: document.getElementById('editReporterPhone').value.trim() || null
        };
        
        try {
            const updatedItem = await storage.updateItem(this.currentItemModal.id, updates);
            
            if (updatedItem) {
                this.showSuccessMessage('Item updated successfully!');
                this.closeEditModal();
                await this.loadItems(); // Refresh the items list
            } else {
                this.showErrorMessage('Failed to update item. Please try again.');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            this.showErrorMessage('Failed to update item. Please try again.');
        }
    }

    // Delete item functionality
    async deleteItem() {
        if (!this.currentItemModal) return;
        
        const confirmDelete = confirm(`Are you sure you want to delete "${this.currentItemModal.title}"? This action cannot be undone.`);
        
        if (!confirmDelete) return;
        
        try {
            const success = await storage.deleteItem(this.currentItemModal.id);
            
            if (success) {
                this.showSuccessMessage('Item deleted successfully!');
                this.closeModal();
                await this.loadItems(); // Refresh the items list
            } else {
                this.showErrorMessage('Failed to delete item. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            this.showErrorMessage('Failed to delete item. Please try again.');
        }
    }

    // Show error message
    showErrorMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// Global functions for HTML onclick handlers
function clearFilters() {
    app.clearFilters();
}

function closeModal() {
    app.closeModal();
}

function contactOwner() {
    app.contactOwner();
}

function closeContactModal() {
    app.closeContactModal();
}

function editItem() {
    app.editItem();
}

function deleteItem() {
    app.deleteItem();
}

function closeEditModal() {
    app.closeEditModal();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Initializing Lost & Found App...');
        window.app = new LostAndFoundApp();
        console.log('✅ App instance created');
        await window.app.init();
        console.log('✅ App initialization complete');
    } catch (error) {
        console.error('❌ App initialization failed:', error);
    }
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .fade-in {
        animation: fadeIn 0.6s ease forwards;
    }

    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }

    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`;
document.head.appendChild(style);