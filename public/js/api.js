// API Service for Blood Bank Management System

class APIService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
        } else {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        }
    }

    // Get authentication headers
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(options.auth !== false),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication APIs
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            auth: false
        });
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            auth: false
        });
    }

    async getProfile() {
        return this.request('/auth/me');
    }

    async updateProfile(userData) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async changePassword(currentPassword, newPassword) {
        return this.request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    // Donation APIs
    async getDonations(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/donations${queryString ? '?' + queryString : ''}`);
    }

    async getDonation(id) {
        return this.request(`/donations/${id}`);
    }

    async createDonation(donationData) {
        return this.request('/donations', {
            method: 'POST',
            body: JSON.stringify(donationData)
        });
    }

    async updateDonation(id, donationData) {
        return this.request(`/donations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(donationData)
        });
    }

    async deleteDonation(id) {
        return this.request(`/donations/${id}`, {
            method: 'DELETE'
        });
    }

    async approveDonation(id, medicalScreening) {
        return this.request(`/donations/${id}/approve`, {
            method: 'POST',
            body: JSON.stringify({ medicalScreening })
        });
    }

    async rejectDonation(id, rejectionReason) {
        return this.request(`/donations/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ rejectionReason })
        });
    }

    async checkDonationEligibility() {
        return this.request('/donations/eligibility/check');
    }

    // Request APIs
    async getRequests(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/requests${queryString ? '?' + queryString : ''}`);
    }

    async getRequest(id) {
        return this.request(`/requests/${id}`);
    }

    async createRequest(requestData) {
        return this.request('/requests', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
    }

    async updateRequest(id, requestData) {
        return this.request(`/requests/${id}`, {
            method: 'PUT',
            body: JSON.stringify(requestData)
        });
    }

    async deleteRequest(id) {
        return this.request(`/requests/${id}`, {
            method: 'DELETE'
        });
    }

    async approveRequest(id) {
        return this.request(`/requests/${id}/approve`, {
            method: 'POST'
        });
    }

    async rejectRequest(id, rejectionReason) {
        return this.request(`/requests/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ rejectionReason })
        });
    }

    async assignDonation(requestId, donationId, quantity) {
        return this.request(`/requests/${requestId}/assign-donation`, {
            method: 'POST',
            body: JSON.stringify({ donationId, quantity })
        });
    }

    // Inventory APIs
    async getInventory(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/inventory${queryString ? '?' + queryString : ''}`, {
            auth: false
        });
    }

    async getBloodTypeInventory(bloodType, includeDetails = false) {
        return this.request(`/inventory/${bloodType}?includeDetails=${includeDetails}`, {
            auth: false
        });
    }

    async updateInventoryThreshold(bloodType, thresholds) {
        return this.request(`/inventory/${bloodType}/threshold`, {
            method: 'PUT',
            body: JSON.stringify(thresholds)
        });
    }

    async getInventoryAlerts() {
        return this.request('/inventory/alerts/active');
    }

    async initializeInventory() {
        return this.request('/inventory/initialize', {
            method: 'POST'
        });
    }

    async getInventoryStatistics() {
        return this.request('/inventory/statistics/summary');
    }

    // User Management APIs
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/users${queryString ? '?' + queryString : ''}`);
    }

    async getUser(id) {
        return this.request(`/users/${id}`);
    }

    async getUserDonations(id, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/users/${id}/donations${queryString ? '?' + queryString : ''}`);
    }

    async getUserRequests(id, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/users/${id}/requests${queryString ? '?' + queryString : ''}`);
    }

    async updateUserStatus(id, isActive) {
        return this.request(`/users/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ isActive })
        });
    }

    async verifyUser(id) {
        return this.request(`/users/${id}/verify`, {
            method: 'PUT'
        });
    }

    async deleteUser(id) {
        return this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }

    async getUserStatistics() {
        return this.request('/users/statistics/summary');
    }

    // Admin Dashboard APIs
    async getDashboardData() {
        return this.request('/admin/dashboard');
    }

    async getDonationAnalytics(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/admin/analytics/donations${queryString ? '?' + queryString : ''}`);
    }

    async getRequestAnalytics(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/admin/analytics/requests${queryString ? '?' + queryString : ''}`);
    }

    async exportData(type, params = {}) {
        const queryString = new URLSearchParams({ type, ...params }).toString();
        return this.request(`/admin/reports/export?${queryString}`);
    }
}

// Toast notification system
class ToastManager {
    constructor() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = CONFIG.TOAST_DURATION) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);

        return toast;
    }

    getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Loading manager
class LoadingManager {
    constructor() {
        this.spinner = document.getElementById('loadingSpinner');
        if (!this.spinner) {
            this.spinner = document.createElement('div');
            this.spinner.id = 'loadingSpinner';
            this.spinner.className = 'loading-spinner';
            this.spinner.innerHTML = `
                <div class="spinner"></div>
                <p>Loading...</p>
            `;
            this.spinner.style.display = 'none';
            document.body.appendChild(this.spinner);
        }
    }

    show(message = 'Loading...') {
        this.spinner.querySelector('p').textContent = message;
        this.spinner.style.display = 'flex';
    }

    hide() {
        this.spinner.style.display = 'none';
    }
}

// Initialize global instances
window.api = new APIService();
window.toast = new ToastManager();
window.loading = new LoadingManager();

// Error handler for API calls
window.handleAPIError = (error, showToast = true) => {
    console.error('API Error:', error);
    
    if (showToast) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            toast.error('Session expired. Please login again.');
            // Redirect to login
            setTimeout(() => {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
                localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
                window.location.reload();
            }, 2000);
        } else {
            toast.error(error.message || 'An error occurred. Please try again.');
        }
    }
    
    return error;
};
