// Authentication System for Lost & Found Website

class Auth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        this.currentUser = storage.getCurrentUser();
        this.updateUI();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Auth form submission
        document.getElementById('authForm')?.addEventListener('submit', this.handleAuthSubmit.bind(this));
    }

    // Update UI based on authentication state
    updateUI() {
        const loginBtn = document.querySelector('.btn-login');
        const signupBtn = document.querySelector('.btn-signup');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                userName.textContent = this.currentUser.name || this.currentUser.email;
            }
        } else {
            // User is not logged in
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    // Handle form submission for both login and signup
    async handleAuthSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;
        const name = document.getElementById('authName').value.trim();
        const isSignup = document.getElementById('nameGroup').style.display !== 'none';

        // Basic validation
        if (!email || !password) {
            this.showAuthError('Email and password are required');
            return;
        }

        if (isSignup && !name) {
            this.showAuthError('Name is required for signup');
            return;
        }

        if (password.length < 6) {
            this.showAuthError('Password must be at least 6 characters long');
            return;
        }

        try {
            let result;
            if (isSignup) {
                result = this.register(email, password, name);
            } else {
                result = this.login(email, password);
            }

            if (result.success) {
                this.currentUser = result.user;
                this.updateUI();
                this.closeAuthModal();
                this.showSuccess(isSignup ? 'Account created successfully!' : 'Welcome back!');
                form.reset();
            } else {
                this.showAuthError(result.error);
            }
        } catch (error) {
            console.error('Auth error:', error);
            this.showAuthError('An error occurred. Please try again.');
        }
    }

    // Login user
    login(email, password) {
        return storage.loginUser(email, password);
    }

    // Register new user
    register(email, password, name) {
        const userData = {
            email: email,
            password: password, // In a real app, this would be hashed
            name: name
        };
        
        return storage.registerUser(userData);
    }

    // Logout user
    logout() {
        storage.logoutUser();
        this.currentUser = null;
        this.updateUI();
        this.showSuccess('Logged out successfully');
        
        // Redirect to home page if on a protected page
        if (window.location.pathname.includes('report-')) {
            window.location.href = 'index.html';
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Require authentication for certain actions
    requireAuth(callback) {
        if (this.isAuthenticated()) {
            callback();
        } else {
            this.showAuthModal('login');
            this.showAuthError('Please log in to continue');
        }
    }

    // Show authentication modal
    showAuthModal(mode = 'login') {
        const modal = document.getElementById('authModal');
        const title = document.getElementById('authTitle');
        const nameGroup = document.getElementById('nameGroup');
        const submitBtn = document.getElementById('authSubmit');
        const switchText = document.getElementById('authSwitchText');

        if (mode === 'signup') {
            title.textContent = 'Sign Up';
            nameGroup.style.display = 'block';
            submitBtn.textContent = 'Sign Up';
            switchText.innerHTML = 'Already have an account? <a href="#" onclick="auth.toggleAuthMode()">Login</a>';
        } else {
            title.textContent = 'Login';
            nameGroup.style.display = 'none';
            submitBtn.textContent = 'Login';
            switchText.innerHTML = 'Don\'t have an account? <a href="#" onclick="auth.toggleAuthMode()">Sign up</a>';
        }

        modal.style.display = 'block';
        this.clearAuthError();
    }

    // Close authentication modal
    closeAuthModal() {
        const modal = document.getElementById('authModal');
        modal.style.display = 'none';
        this.clearAuthError();
        document.getElementById('authForm').reset();
    }

    // Toggle between login and signup modes
    toggleAuthMode() {
        const title = document.getElementById('authTitle');
        const nameGroup = document.getElementById('nameGroup');
        const submitBtn = document.getElementById('authSubmit');
        const switchText = document.getElementById('authSwitchText');

        const isLoginMode = title.textContent === 'Login';

        if (isLoginMode) {
            // Switch to signup mode
            title.textContent = 'Sign Up';
            nameGroup.style.display = 'block';
            submitBtn.textContent = 'Sign Up';
            switchText.innerHTML = 'Already have an account? <a href="#" onclick="auth.toggleAuthMode()">Login</a>';
        } else {
            // Switch to login mode
            title.textContent = 'Login';
            nameGroup.style.display = 'none';
            submitBtn.textContent = 'Login';
            switchText.innerHTML = 'Don\'t have an account? <a href="#" onclick="auth.toggleAuthMode()">Sign up</a>';
        }

        this.clearAuthError();
    }

    // Show authentication error
    showAuthError(message) {
        // Remove existing error message
        const existingError = document.querySelector('.auth-error');
        if (existingError) {
            existingError.remove();
        }

        // Create new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.style.cssText = `
            color: #dc2626;
            background: #fee2e2;
            padding: 0.5rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
        `;
        errorDiv.textContent = message;

        // Insert before the form
        const form = document.getElementById('authForm');
        form.parentNode.insertBefore(errorDiv, form);
    }

    // Clear authentication error
    clearAuthError() {
        const existingError = document.querySelector('.auth-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // Show success message
    showSuccess(message) {
        // Create success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'success-notification';
        successDiv.style.cssText = `
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
        successDiv.textContent = message;

        document.body.appendChild(successDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Check password strength
    checkPasswordStrength(password) {
        const strength = {
            weak: password.length < 6,
            medium: password.length >= 6 && password.length < 10,
            strong: password.length >= 10 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
        };

        if (strength.strong) return 'strong';
        if (strength.medium) return 'medium';
        return 'weak';
    }

    // Auto-fill contact email when user is logged in
    fillContactEmail() {
        const contactEmailField = document.getElementById('contactEmail');
        if (contactEmailField && this.currentUser) {
            contactEmailField.value = this.currentUser.email;
        }
    }
}

// Global functions for HTML onclick handlers
function showAuthModal(mode) {
    auth.showAuthModal(mode);
}

function closeAuthModal() {
    auth.closeAuthModal();
}

function toggleAuthMode() {
    auth.toggleAuthMode();
}

function logout() {
    auth.logout();
}

// Create global auth instance
window.auth = new Auth();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);