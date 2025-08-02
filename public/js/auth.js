// Authentication module for Blood Bank Management System

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);

        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                api.setToken(token);
                this.showDashboard();
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.logout();
            }
        } else {
            this.showPublicInterface();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Modal controls
        this.setupModalControls();

        // Navigation buttons
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const donateBtn = document.getElementById('donateBtn');
        const requestBtn = document.getElementById('requestBtn');

        if (loginBtn) loginBtn.addEventListener('click', () => this.showLoginModal());
        if (registerBtn) registerBtn.addEventListener('click', () => this.showRegisterModal());
        if (donateBtn) donateBtn.addEventListener('click', () => this.handleDonateClick());
        if (requestBtn) requestBtn.addEventListener('click', () => this.handleRequestClick());
    }

    setupModalControls() {
        // Close buttons
        const closeLogin = document.getElementById('closeLogin');
        const closeRegister = document.getElementById('closeRegister');
        const switchToRegister = document.getElementById('switchToRegister');
        const switchToLogin = document.getElementById('switchToLogin');

        if (closeLogin) closeLogin.addEventListener('click', () => this.hideLoginModal());
        if (closeRegister) closeRegister.addEventListener('click', () => this.hideRegisterModal());
        if (switchToRegister) switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideLoginModal();
            this.showRegisterModal();
        });
        if (switchToLogin) switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideRegisterModal();
            this.showLoginModal();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const loginModal = document.getElementById('loginModal');
            const registerModal = document.getElementById('registerModal');
            
            if (e.target === loginModal) this.hideLoginModal();
            if (e.target === registerModal) this.hideRegisterModal();
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!Utils.isValidEmail(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        loading.show('Logging in...');

        try {
            const response = await api.login(email, password);
            
            if (response.success) {
                this.currentUser = response.data.user;
                this.isAuthenticated = true;
                
                // Store token and user data
                api.setToken(response.data.token);
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
                
                toast.success(`Welcome back, ${this.currentUser.name}!`);
                this.hideLoginModal();
                this.showDashboard();
            }
        } catch (error) {
            handleAPIError(error);
        } finally {
            loading.hide();
        }
    }

    async handleRegister(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            phone: document.getElementById('registerPhone').value,
            bloodType: document.getElementById('registerBloodType').value,
            dateOfBirth: document.getElementById('registerDOB').value,
            gender: document.getElementById('registerGender').value,
            role: document.getElementById('registerRole').value,
            password: document.getElementById('registerPassword').value
        };

        // Validation
        if (!this.validateRegistrationForm(formData)) {
            return;
        }

        // Add address placeholder (can be updated later in profile)
        formData.address = {
            street: 'TBD',
            city: 'TBD',
            state: 'TBD',
            zipCode: 'TBD'
        };

        loading.show('Creating account...');

        try {
            const response = await api.register(formData);
            
            if (response.success) {
                this.currentUser = response.data.user;
                this.isAuthenticated = true;
                
                // Store token and user data
                api.setToken(response.data.token);
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
                
                toast.success(`Welcome, ${this.currentUser.name}! Your account has been created.`);
                this.hideRegisterModal();
                this.showDashboard();
            }
        } catch (error) {
            handleAPIError(error);
        } finally {
            loading.hide();
        }
    }

    validateRegistrationForm(formData) {
        // Check required fields
        const requiredFields = ['name', 'email', 'phone', 'bloodType', 'dateOfBirth', 'gender', 'role', 'password'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                toast.error(`${Utils.capitalize(field)} is required`);
                return false;
            }
        }

        // Validate email
        if (!Utils.isValidEmail(formData.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }

        // Validate phone
        if (!Utils.isValidPhone(formData.phone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return false;
        }

        // Validate password
        if (formData.password.length < CONFIG.VALIDATION.PASSWORD_MIN_LENGTH) {
            toast.error(`Password must be at least ${CONFIG.VALIDATION.PASSWORD_MIN_LENGTH} characters long`);
            return false;
        }

        // Validate age for donors
        if (formData.role === 'donor') {
            const age = Utils.calculateAge(formData.dateOfBirth);
            if (age < 18 || age > 65) {
                toast.error('Donors must be between 18 and 65 years old');
                return false;
            }
        }

        return true;
    }

    handleDonateClick() {
        if (this.isAuthenticated) {
            if (this.currentUser.role === 'donor') {
                // Navigate to donation form in dashboard
                this.showDashboard('donations');
            } else {
                toast.info('Only registered donors can donate blood. Please register as a donor.');
            }
        } else {
            // Show register modal with donor pre-selected
            this.showRegisterModal();
            setTimeout(() => {
                const roleSelect = document.getElementById('registerRole');
                if (roleSelect) roleSelect.value = 'donor';
            }, 100);
        }
    }

    handleRequestClick() {
        if (this.isAuthenticated) {
            if (this.currentUser.role === 'recipient') {
                // Navigate to request form in dashboard
                this.showDashboard('requests');
            } else {
                toast.info('Only registered recipients can request blood. Please register as a recipient.');
            }
        } else {
            // Show register modal with recipient pre-selected
            this.showRegisterModal();
            setTimeout(() => {
                const roleSelect = document.getElementById('registerRole');
                if (roleSelect) roleSelect.value = 'recipient';
            }, 100);
        }
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'block';
            // Clear form
            document.getElementById('loginForm').reset();
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showRegisterModal() {
        const modal = document.getElementById('registerModal');
        if (modal) {
            modal.style.display = 'block';
            // Clear form
            document.getElementById('registerForm').reset();
        }
    }

    hideRegisterModal() {
        const modal = document.getElementById('registerModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showPublicInterface() {
        // Hide dashboard and show public interface
        const dashboardContainer = document.getElementById('dashboardContainer');
        const publicSections = document.querySelectorAll('.hero, .inventory-section, .about-section, .footer');
        const navbar = document.getElementById('navbar');

        if (dashboardContainer) {
            dashboardContainer.style.display = 'none';
        }

        publicSections.forEach(section => {
            if (section) section.style.display = 'block';
        });

        if (navbar) {
            navbar.style.display = 'block';
        }

        // Update navigation
        this.updateNavigation();
    }

    showDashboard(activeTab = null) {
        // Hide public interface and show dashboard
        const dashboardContainer = document.getElementById('dashboardContainer');
        const publicSections = document.querySelectorAll('.hero, .inventory-section, .about-section, .footer');
        const navbar = document.getElementById('navbar');

        publicSections.forEach(section => {
            if (section) section.style.display = 'none';
        });

        if (navbar) {
            navbar.style.display = 'none';
        }

        if (dashboardContainer) {
            dashboardContainer.style.display = 'block';
            // Load dashboard content based on user role
            if (window.dashboardManager) {
                window.dashboardManager.loadDashboard(this.currentUser.role, activeTab);
            } else {
                // Wait for dashboard manager to be available
                const checkDashboard = () => {
                    if (window.dashboardManager) {
                        window.dashboardManager.loadDashboard(this.currentUser.role, activeTab);
                    } else {
                        setTimeout(checkDashboard, 100);
                    }
                };
                checkDashboard();
            }
        }
    }

    updateNavigation() {
        const navAuth = document.querySelector('.nav-auth');
        
        if (this.isAuthenticated && navAuth) {
            navAuth.innerHTML = `
                <span class="nav-user">Welcome, ${this.currentUser.name}</span>
                <button class="btn btn-outline" onclick="auth.showDashboard()">Dashboard</button>
                <button class="btn btn-primary" onclick="logout()">Logout</button>
            `;
        } else if (navAuth) {
            navAuth.innerHTML = `
                <button class="btn btn-outline" id="loginBtn">Login</button>
                <button class="btn btn-primary" id="registerBtn">Register</button>
            `;
            
            // Re-attach event listeners
            document.getElementById('loginBtn').addEventListener('click', () => this.showLoginModal());
            document.getElementById('registerBtn').addEventListener('click', () => this.showRegisterModal());
        }
    }

    async logout() {
        console.log('Logout function called');
        loading.show('Logging out...');

        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage
            localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
            
            // Reset state
            this.currentUser = null;
            this.isAuthenticated = false;
            api.setToken(null);
            
            // Show public interface
            this.showPublicInterface();
            
            toast.success('Logged out successfully');
            loading.hide();
            
            console.log('Logout completed successfully');
        }
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.isAuthenticated && this.currentUser && this.currentUser.role === role;
    }

    // Check if user is admin
    isAdmin() {
        return this.hasRole(CONFIG.USER_ROLES.ADMIN);
    }

    // Check if user is donor
    isDonor() {
        return this.hasRole(CONFIG.USER_ROLES.DONOR);
    }

    // Check if user is recipient
    isRecipient() {
        return this.hasRole(CONFIG.USER_ROLES.RECIPIENT);
    }
}

// Initialize authentication manager
window.auth = new AuthManager();

// Global logout function for easy access
window.logout = function() {
    console.log('Global logout called');
    if (window.auth) {
        window.auth.logout();
    } else {
        console.error('Auth manager not available');
    }
};
