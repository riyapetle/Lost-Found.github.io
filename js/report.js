// Report Forms JavaScript for Lost & Found Website

class ReportHandler {
    constructor() {
        this.currentImageFile = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.prefillUserData();
        this.setupMobileMenu();
    }

    setupEventListeners() {
        // Form submission handlers
        const reportLostForm = document.getElementById('reportLostForm');
        const reportFoundForm = document.getElementById('reportFoundForm');

        if (reportLostForm) {
            reportLostForm.addEventListener('submit', this.handleLostItemSubmit.bind(this));
        }

        if (reportFoundForm) {
            reportFoundForm.addEventListener('submit', this.handleFoundItemSubmit.bind(this));
        }

        // Image upload handler
        const imageInput = document.getElementById('itemImage');
        if (imageInput) {
            imageInput.addEventListener('change', this.handleImageUpload.bind(this));
        }

        // Character counter for description
        const descriptionField = document.getElementById('description');
        if (descriptionField) {
            descriptionField.addEventListener('input', this.updateCharCount.bind(this));
        }

        // Reward checkbox handler
        const rewardCheckbox = document.getElementById('rewardOffered');
        if (rewardCheckbox) {
            rewardCheckbox.addEventListener('change', this.toggleRewardDetails.bind(this));
        }
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

    // Pre-fill user data (removed - no authentication)
    prefillUserData() {
        // No authentication system, so no pre-filling needed
    }

    // Handle lost item form submission
    async handleLostItemSubmit(event) {
        event.preventDefault();
        
        console.log('📝 Starting lost item submission...');
        
        if (!this.validateForm('lost')) {
            console.log('❌ Form validation failed');
            return;
        }

        // Wait for storage to be ready
        console.log('⌛ Waiting for storage to be ready...');
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds
        
        while (!window.storage?.isReady && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.storage?.isReady) {
            console.log('❌ Storage not ready after timeout');
            this.showError('System not ready. Please wait a moment and try again.');
            return;
        }
        
        console.log('✅ Storage is ready, collecting form data...');
        const formData = await this.collectFormData('lost');
        console.log('📦 Form data collected:', formData);
        
        try {
            // Add item to storage
            console.log('💾 Adding item to storage...');
            const newItem = await storage.addItem(formData);
            
            if (newItem) {
                console.log('✅ Item saved successfully:', newItem);
                this.showSuccessModal();
            } else {
                console.log('❌ Failed to save item - no result returned');
                this.showError('Failed to save item. Please try again.');
            }
        } catch (error) {
            console.error('❌ Error submitting lost item:', error);
            this.showError('Failed to save item. Please try again.');
        }
    }

    // Handle found item form submission
    async handleFoundItemSubmit(event) {
        event.preventDefault();
        
        if (!this.validateForm('found')) {
            return;
        }

        const formData = await this.collectFormData('found');
        
        try {
            // Add item to storage
            const newItem = await storage.addItem(formData);
            
            if (newItem) {
                this.showSuccessModal();
            } else {
                this.showError('Failed to save item. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting found item:', error);
            this.showError('Failed to save item. Please try again.');
        }
    }

    // Validate form data
    validateForm(type) {
        const errors = [];

        // Common validation
        const itemName = document.getElementById('itemName').value.trim();
        const category = document.getElementById('category').value;
        const location = document.getElementById('location').value.trim();
        const description = document.getElementById('description').value.trim();
        const reporterName = document.getElementById('reporterName').value.trim();
        const reporterEmail = document.getElementById('reporterEmail').value.trim();
        const agreement = document.getElementById('agreement').checked;

        if (!itemName) errors.push('Item name is required');
        if (!category) errors.push('Category is required');
        if (!location) errors.push('Location is required');
        if (!description) errors.push('Description is required');
        if (!reporterName) errors.push('Your name is required');
        if (!reporterEmail) errors.push('Email address is required');
        if (!agreement) errors.push('You must agree to the terms');

        // Email validation
        if (reporterEmail && !this.validateEmail(reporterEmail)) {
            errors.push('Please enter a valid email address');
        }

        // Description length check
        if (description.length > 500) {
            errors.push('Description must be 500 characters or less');
        }

        // Type-specific validation
        if (type === 'found') {
            const availability = document.getElementById('availability').value.trim();
            if (!availability) {
                errors.push('Availability information is required');
            }
        }

        // Show errors if any
        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return false;
        }

        return true;
    }

    // Collect form data
    async collectFormData(type) {
        const baseData = {
            type: type,
            title: document.getElementById('itemName').value.trim(),
            category: document.getElementById('category').value,
            location: document.getElementById('location').value.trim(),
            description: document.getElementById('description').value.trim(),
            reporterName: document.getElementById('reporterName').value.trim(),
            reporterEmail: document.getElementById('reporterEmail').value.trim(),
            reporterPhone: document.getElementById('reporterPhone').value.trim() || null
        };

        // Handle image upload
        if (this.currentImageFile) {
            if (typeof this.currentImageFile === 'string' && this.currentImageFile.startsWith('data:')) {
                // It's a data URL, use as is for localStorage fallback
                baseData.image = this.currentImageFile;
            } else {
                // It's a file, upload to Supabase
                const imageUrl = await storage.uploadImage(this.currentImageFile, this.currentImageFile.name || 'image.jpg');
                if (imageUrl) {
                    baseData.image = imageUrl;
                }
            }
        }

        // Type-specific data
        if (type === 'lost') {
            const dateLost = document.getElementById('dateLost').value;
            const rewardOffered = document.getElementById('rewardOffered').checked;
            const rewardAmount = document.getElementById('rewardAmount').value.trim();

            if (dateLost) baseData.dateLost = dateLost;
            if (rewardOffered && rewardAmount) baseData.reward = rewardAmount;
            
        } else if (type === 'found') {
            const dateFound = document.getElementById('dateFound').value;
            const currentLocation = document.getElementById('currentLocation').value.trim();
            const verificationQuestions = document.getElementById('verificationQuestions').value.trim();
            const availability = document.getElementById('availability').value.trim();

            if (dateFound) baseData.dateFound = dateFound;
            if (currentLocation) baseData.currentLocation = currentLocation;
            if (verificationQuestions) baseData.verificationQuestions = verificationQuestions;
            if (availability) baseData.availability = availability;
        }

        return baseData;
    }

    // Handle image upload
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            this.showError('Image size must be less than 5MB');
            event.target.value = '';
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            this.showError('Please upload a valid image file (JPG, PNG, or GIF)');
            event.target.value = '';
            return;
        }

        // Store the actual file object for Supabase upload
        this.currentImageFile = file;

        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const imagePreview = document.getElementById('imagePreview');
            const uploadPlaceholder = document.querySelector('.upload-placeholder');
            const previewImg = document.getElementById('previewImg');

            previewImg.src = e.target.result;
            uploadPlaceholder.style.display = 'none';
            imagePreview.style.display = 'block';
        };

        reader.readAsDataURL(file);
    }

    // Remove uploaded image
    removeImage() {
        const imagePreview = document.getElementById('imagePreview');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');
        const imageInput = document.getElementById('itemImage');

        imagePreview.style.display = 'none';
        uploadPlaceholder.style.display = 'block';
        imageInput.value = '';
        this.currentImageFile = null;
    }

    // Update character count for description
    updateCharCount() {
        const description = document.getElementById('description');
        const charCount = document.getElementById('charCount');
        
        if (description && charCount) {
            const count = description.value.length;
            charCount.textContent = count;
            
            // Change color based on character limit
            if (count > 450) {
                charCount.style.color = '#ef4444';
            } else if (count > 400) {
                charCount.style.color = '#f59e0b';
            } else {
                charCount.style.color = '#6b7280';
            }
        }
    }

    // Toggle reward details section
    toggleRewardDetails() {
        const rewardCheckbox = document.getElementById('rewardOffered');
        const rewardDetails = document.getElementById('rewardDetails');
        
        if (rewardCheckbox && rewardDetails) {
            rewardDetails.style.display = rewardCheckbox.checked ? 'block' : 'none';
        }
    }

    // Show success modal
    showSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.style.display = 'block';
    }

    // Show validation errors
    showValidationErrors(errors) {
        const errorContainer = document.getElementById('validationErrors') || this.createErrorContainer();
        
        errorContainer.innerHTML = `
            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
                <h4 style="color: #dc2626; margin-bottom: 0.5rem;">Please fix the following errors:</h4>
                <ul style="color: #dc2626; margin: 0; padding-left: 1.5rem;">
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;

        // Scroll to errors
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Create error container if it doesn't exist
    createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'validationErrors';
        
        const formHeader = document.querySelector('.form-header');
        if (formHeader) {
            formHeader.parentNode.insertBefore(container, formHeader.nextSibling);
        } else {
            const form = document.querySelector('.report-form');
            form.insertBefore(container, form.firstChild);
        }
        
        return container;
    }

    // Show error message
    showError(message) {
        const notification = document.createElement('div');
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

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Clear form
    clearForm() {
        const forms = document.querySelectorAll('.report-form');
        forms.forEach(form => {
            form.reset();
        });

        // Clear image preview
        this.removeImage();

        // Clear validation errors
        const errorContainer = document.getElementById('validationErrors');
        if (errorContainer) {
            errorContainer.innerHTML = '';
        }

        // Reset character count
        this.updateCharCount();
    }
}

// Global functions for HTML onclick handlers
function removeImage() {
    reportHandler.removeImage();
}

function goToHome() {
    window.location.href = 'index.html';
}

function reportAnother() {
    document.getElementById('successModal').style.display = 'none';
    reportHandler.clearForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    const successModal = document.getElementById('successModal');
    
    if (event.target === successModal) {
        successModal.style.display = 'none';
    }
});

// Close modals with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const successModal = document.getElementById('successModal');
        
        if (successModal.style.display === 'block') {
            successModal.style.display = 'none';
        }
    }
});

// Initialize report handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reportHandler = new ReportHandler();
});

