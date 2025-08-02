// Real-time Notifications System for Blood Bank Management

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.socket = null;
        this.isConnected = false;
        this.retryInterval = null;
        this.maxNotifications = 10;
        this.initialize();
    }

    initialize() {
        console.log('🔔 Initializing Notification Manager...');
        this.createNotificationContainer();
        this.setupWebSocket();
        this.setupEventListeners();
        this.loadStoredNotifications();
    }

    createNotificationContainer() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    setupWebSocket() {
        try {
            // For now, we'll simulate real-time notifications
            // In a real implementation, you'd connect to a WebSocket server
            this.simulateRealTimeNotifications();
        } catch (error) {
            console.error('Failed to setup WebSocket:', error);
        }
    }

    simulateRealTimeNotifications() {
        // Simulate real-time notifications for demo purposes
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every interval
                this.generateRandomNotification();
            }
        }, 30000); // Check every 30 seconds
    }

    generateRandomNotification() {
        const notificationTypes = [
            {
                type: 'info',
                title: 'System Update',
                message: 'Blood inventory has been updated',
                icon: 'fas fa-info-circle'
            },
            {
                type: 'success',
                title: 'Donation Approved',
                message: 'A new blood donation has been approved',
                icon: 'fas fa-check-circle'
            },
            {
                type: 'warning',
                title: 'Low Stock Alert',
                message: 'Blood type A+ is running low',
                icon: 'fas fa-exclamation-triangle'
            },
            {
                type: 'error',
                title: 'Critical Request',
                message: 'Urgent blood request requires attention',
                icon: 'fas fa-exclamation-circle'
            }
        ];

        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        this.showNotification(randomType.title, randomType.message, randomType.type, randomType.icon);
    }

    setupEventListeners() {
        // Listen for custom events
        document.addEventListener('donationSubmitted', (e) => {
            this.showNotification(
                'Donation Submitted',
                'Your blood donation request has been submitted successfully',
                'success',
                'fas fa-heart'
            );
        });

        document.addEventListener('requestSubmitted', (e) => {
            this.showNotification(
                'Request Submitted',
                'Your blood request has been submitted and is under review',
                'info',
                'fas fa-clipboard-list'
            );
        });

        document.addEventListener('inventoryUpdated', (e) => {
            this.showNotification(
                'Inventory Updated',
                'Blood inventory has been updated with latest data',
                'info',
                'fas fa-warehouse'
            );
        });

        document.addEventListener('userLoggedIn', (e) => {
            this.showNotification(
                'Welcome Back',
                `Welcome back, ${e.detail.userName || 'User'}!`,
                'success',
                'fas fa-user'
            );
        });

        // Listen for system events
        window.addEventListener('online', () => {
            this.showNotification(
                'Connection Restored',
                'You are now connected to the server',
                'success',
                'fas fa-wifi'
            );
        });

        window.addEventListener('offline', () => {
            this.showNotification(
                'Connection Lost',
                'You are currently offline. Some features may be limited.',
                'warning',
                'fas fa-exclamation-triangle'
            );
        });
    }

    showNotification(title, message, type = 'info', icon = 'fas fa-info-circle') {
        const notification = {
            id: Date.now() + Math.random(),
            title,
            message,
            type,
            icon,
            timestamp: new Date(),
            read: false
        };

        this.notifications.unshift(notification);
        
        // Limit the number of stored notifications
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }

        this.displayNotification(notification);
        this.storeNotifications();
        this.updateNotificationBadge();

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, 5000);
    }

    displayNotification(notification) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notificationElement = document.createElement('div');
        notificationElement.className = `notification notification-${notification.type}`;
        notificationElement.id = `notification-${notification.id}`;
        notificationElement.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <i class="${notification.icon}"></i>
                    <span class="notification-title">${notification.title}</span>
                    <button class="notification-close" onclick="window.notificationManager.removeNotification(${notification.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
            </div>
        `;

        container.appendChild(notificationElement);

        // Add slide-in animation
        setTimeout(() => {
            notificationElement.style.transform = 'translateX(0)';
            notificationElement.style.opacity = '1';
        }, 100);
    }

    removeNotification(id) {
        const notificationElement = document.getElementById(`notification-${id}`);
        if (notificationElement) {
            notificationElement.style.transform = 'translateX(100%)';
            notificationElement.style.opacity = '0';
            
            setTimeout(() => {
                if (notificationElement.parentNode) {
                    notificationElement.parentNode.removeChild(notificationElement);
                }
            }, 300);
        }

        // Remove from notifications array
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.storeNotifications();
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notification-badge');
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return timestamp.toLocaleDateString();
    }

    storeNotifications() {
        try {
            localStorage.setItem('bloodBankNotifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Failed to store notifications:', error);
        }
    }

    loadStoredNotifications() {
        try {
            const stored = localStorage.getItem('bloodBankNotifications');
            if (stored) {
                this.notifications = JSON.parse(stored);
                this.updateNotificationBadge();
            }
        } catch (error) {
            console.error('Failed to load stored notifications:', error);
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.storeNotifications();
        this.updateNotificationBadge();
    }

    clearAllNotifications() {
        this.notifications = [];
        this.storeNotifications();
        this.updateNotificationBadge();
        
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    getNotifications(limit = 10) {
        return this.notifications.slice(0, limit);
    }

    // System notifications
    showSystemNotification(message, type = 'info') {
        this.showNotification('System', message, type, 'fas fa-cog');
    }

    showErrorNotification(message) {
        this.showNotification('Error', message, 'error', 'fas fa-exclamation-circle');
    }

    showSuccessNotification(message) {
        this.showNotification('Success', message, 'success', 'fas fa-check-circle');
    }

    showWarningNotification(message) {
        this.showNotification('Warning', message, 'warning', 'fas fa-exclamation-triangle');
    }

    // Blood bank specific notifications
    showLowStockAlert(bloodType, availableUnits) {
        this.showNotification(
            'Low Stock Alert',
            `${bloodType} blood is running low (${availableUnits} units available)`,
            'warning',
            'fas fa-exclamation-triangle'
        );
    }

    showCriticalStockAlert(bloodType, availableUnits) {
        this.showNotification(
            'Critical Stock Alert',
            `${bloodType} blood is critically low (${availableUnits} units available)`,
            'error',
            'fas fa-exclamation-circle'
        );
    }

    showDonationApprovedNotification(donorName, bloodType) {
        this.showNotification(
            'Donation Approved',
            `${donorName}'s ${bloodType} donation has been approved`,
            'success',
            'fas fa-heart'
        );
    }

    showRequestFulfilledNotification(recipientName, bloodType) {
        this.showNotification(
            'Request Fulfilled',
            `${recipientName}'s ${bloodType} request has been fulfilled`,
            'success',
            'fas fa-clipboard-check'
        );
    }

    showUrgentRequestNotification(recipientName, bloodType, urgency) {
        this.showNotification(
            'Urgent Request',
            `${recipientName} needs ${bloodType} blood (${urgency} priority)`,
            urgency === 'critical' ? 'error' : 'warning',
            'fas fa-exclamation-triangle'
        );
    }

    destroy() {
        if (this.retryInterval) {
            clearInterval(this.retryInterval);
        }
        this.notifications = [];
        this.isConnected = false;
    }
}

// Initialize notification manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
});

// Export for use in other modules
window.NotificationManager = NotificationManager; 