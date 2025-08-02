// Configuration file for the Blood Bank Management System

const CONFIG = {
    // API Base URL - Update this for production
    API_BASE_URL: window.location.origin + '/api',
    
    // Local storage keys
    STORAGE_KEYS: {
        TOKEN: 'bloodbank_token',
        USER: 'bloodbank_user',
        THEME: 'bloodbank_theme'
    },
    
    // Blood types
    BLOOD_TYPES: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    
    // User roles
    USER_ROLES: {
        DONOR: 'donor',
        RECIPIENT: 'recipient',
        ADMIN: 'admin'
    },
    
    // Status types
    STATUS_TYPES: {
        DONATION: {
            PENDING: 'pending',
            APPROVED: 'approved',
            REJECTED: 'rejected',
            COLLECTED: 'collected',
            EXPIRED: 'expired'
        },
        REQUEST: {
            PENDING: 'pending',
            APPROVED: 'approved',
            PARTIALLY_FULFILLED: 'partially_fulfilled',
            FULFILLED: 'fulfilled',
            REJECTED: 'rejected',
            EXPIRED: 'expired'
        }
    },
    
    // Urgency levels
    URGENCY_LEVELS: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        CRITICAL: 'critical'
    },
    
    // Stock status
    STOCK_STATUS: {
        HIGH: 'high',
        NORMAL: 'normal',
        LOW: 'low',
        CRITICAL: 'critical'
    },
    
    // Chart colors
    CHART_COLORS: {
        PRIMARY: '#ea580c',
        SECONDARY: '#fb923c',
        SUCCESS: '#10b981',
        WARNING: '#f59e0b',
        INFO: '#3b82f6',
        DANGER: '#ef4444'
    },
    
    // Pagination
    PAGINATION: {
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    },
    
    // Toast notification duration
    TOAST_DURATION: 5000,
    
    // Auto-refresh intervals (in milliseconds)
    REFRESH_INTERVALS: {
        DASHBOARD: 30000, // 30 seconds
        INVENTORY: 60000, // 1 minute
        NOTIFICATIONS: 15000 // 15 seconds
    },
    
    // Google Maps configuration
    GOOGLE_MAPS: {
        DEFAULT_CENTER: { lat: 40.7128, lng: -74.0060 }, // New York City
        DEFAULT_ZOOM: 12
    },
    
    // Form validation patterns
    VALIDATION: {
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE: /^[0-9]{10}$/,
        PASSWORD_MIN_LENGTH: 6
    },
    
    // Date formats
    DATE_FORMATS: {
        DISPLAY: 'MMM DD, YYYY',
        INPUT: 'YYYY-MM-DD',
        DATETIME: 'MMM DD, YYYY HH:mm'
    }
};

// Utility functions
const Utils = {
    // Format date for display
    formatDate: (date, format = CONFIG.DATE_FORMATS.DISPLAY) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    },
    
    // Format date and time
    formatDateTime: (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Capitalize first letter
    capitalize: (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    // Get status badge class
    getStatusClass: (status, type = 'donation') => {
        const statusMap = {
            pending: 'status-warning',
            approved: 'status-success',
            rejected: 'status-danger',
            collected: 'status-success',
            fulfilled: 'status-success',
            partially_fulfilled: 'status-info',
            expired: 'status-danger',
            high: 'status-success',
            normal: 'status-info',
            low: 'status-warning',
            critical: 'status-danger'
        };
        return statusMap[status] || 'status-secondary';
    },
    
    // Get urgency class
    getUrgencyClass: (urgency) => {
        const urgencyMap = {
            low: 'urgency-low',
            medium: 'urgency-medium',
            high: 'urgency-high',
            critical: 'urgency-critical'
        };
        return urgencyMap[urgency] || 'urgency-medium';
    },
    
    // Validate email
    isValidEmail: (email) => {
        return CONFIG.VALIDATION.EMAIL.test(email);
    },
    
    // Validate phone
    isValidPhone: (phone) => {
        return CONFIG.VALIDATION.PHONE.test(phone);
    },

    // Validate future date
    isValidFutureDate: (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date > today;
    },
    
    // Generate random ID
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Calculate age from date of birth
    calculateAge: (dob) => {
        if (!dob) return 0;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    },
    
    // Get blood type compatibility
    getCompatibleBloodTypes: (bloodType, isRecipient = false) => {
        const donorCompatibility = {
            'A+': ['A+', 'AB+'],
            'A-': ['A+', 'A-', 'AB+', 'AB-'],
            'B+': ['B+', 'AB+'],
            'B-': ['B+', 'B-', 'AB+', 'AB-'],
            'AB+': ['AB+'],
            'AB-': ['AB+', 'AB-'],
            'O+': ['A+', 'B+', 'AB+', 'O+'],
            'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        };
        
        const recipientCompatibility = {
            'A+': ['A+', 'A-', 'O+', 'O-'],
            'A-': ['A-', 'O-'],
            'B+': ['B+', 'B-', 'O+', 'O-'],
            'B-': ['B-', 'O-'],
            'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            'AB-': ['A-', 'B-', 'AB-', 'O-'],
            'O+': ['O+', 'O-'],
            'O-': ['O-']
        };
        
        return isRecipient ? recipientCompatibility[bloodType] : donorCompatibility[bloodType];
    },
    
    // Format file size
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Copy to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }
};

// Export for use in other files
window.CONFIG = CONFIG;
window.Utils = Utils;
