// System Status Monitor for Blood Bank Management System

class SystemStatusMonitor {
    constructor() {
        this.statusData = {
            server: 'unknown',
            database: 'unknown',
            email: 'unknown',
            api: 'unknown',
            lastCheck: null
        };
        this.checkInterval = null;
        this.initialize();
    }

    initialize() {
        console.log('🔍 Initializing System Status Monitor...');
        this.setupStatusDisplay();
        this.startMonitoring();
    }

    setupStatusDisplay() {
        // Create status indicator in the header if it doesn't exist
        const header = document.querySelector('header');
        if (header && !document.getElementById('system-status')) {
            const statusIndicator = document.createElement('div');
            statusIndicator.id = 'system-status';
            statusIndicator.className = 'system-status-indicator';
            statusIndicator.innerHTML = `
                <div class="status-dot"></div>
                <span class="status-text">Checking...</span>
            `;
            header.appendChild(statusIndicator);
        }
    }

    startMonitoring() {
        // Initial check
        this.checkSystemStatus();
        
        // Set up periodic monitoring (every 30 seconds)
        this.checkInterval = setInterval(() => {
            this.checkSystemStatus();
        }, 30000);
    }

    async checkSystemStatus() {
        try {
            const checks = await Promise.allSettled([
                this.checkServerStatus(),
                this.checkDatabaseStatus(),
                this.checkEmailStatus(),
                this.checkAPIStatus()
            ]);

            this.updateStatusData(checks);
            this.updateStatusDisplay();
            this.statusData.lastCheck = new Date();

        } catch (error) {
            console.error('System status check failed:', error);
            this.updateStatusDisplay('error');
        }
    }

    async checkServerStatus() {
        try {
            const response = await fetch('/api/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.ok ? 'healthy' : 'degraded';
        } catch (error) {
            return 'down';
        }
    }

    async checkDatabaseStatus() {
        try {
            const response = await fetch('/api/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.ok ? 'healthy' : 'degraded';
        } catch (error) {
            return 'down';
        }
    }

    async checkEmailStatus() {
        try {
            const response = await fetch('/api/contact/status', {
                method: 'GET'
            });
            return response.ok ? 'healthy' : 'degraded';
        } catch (error) {
            return 'down';
        }
    }

    async checkAPIStatus() {
        try {
            const response = await fetch('/api/auth/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // Check if the API is responding
            return response.ok ? 'healthy' : 'down';
        } catch (error) {
            return 'down';
        }
    }

    updateStatusData(checks) {
        const [server, database, email, api] = checks.map(check => 
            check.status === 'fulfilled' ? check.value : 'down'
        );

        this.statusData = {
            server,
            database,
            email,
            api,
            lastCheck: new Date()
        };
    }

    updateStatusDisplay() {
        const statusIndicator = document.getElementById('system-status');
        if (!statusIndicator) return;

        const overallStatus = this.getOverallStatus();
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('.status-text');

        // Update status dot
        statusDot.className = `status-dot ${overallStatus}`;

        // Update status text
        statusText.textContent = this.getStatusText(overallStatus);

        // Add click handler for detailed status
        statusIndicator.onclick = () => this.showDetailedStatus();
    }

    getOverallStatus() {
        const { server, database, email, api } = this.statusData;
        
        if (server === 'down' || database === 'down') {
            return 'critical';
        } else if (server === 'degraded' || database === 'degraded') {
            return 'warning';
        } else if (email === 'down' || api === 'down') {
            return 'warning';
        } else {
            return 'healthy';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'healthy':
                return 'All Systems Operational';
            case 'warning':
                return 'Minor Issues Detected';
            case 'critical':
                return 'System Issues';
            default:
                return 'Checking Status...';
        }
    }

    showDetailedStatus() {
        const modal = document.createElement('div');
        modal.className = 'status-modal';
        modal.innerHTML = `
            <div class="status-modal-content">
                <div class="status-modal-header">
                    <h3>System Status</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="status-modal-body">
                    <div class="status-grid">
                        <div class="status-item">
                            <div class="status-icon server ${this.statusData.server}"></div>
                            <div class="status-info">
                                <h4>Server</h4>
                                <p>${this.getStatusDescription(this.statusData.server)}</p>
                            </div>
                        </div>
                        <div class="status-item">
                            <div class="status-icon database ${this.statusData.database}"></div>
                            <div class="status-info">
                                <h4>Database</h4>
                                <p>${this.getStatusDescription(this.statusData.database)}</p>
                            </div>
                        </div>
                        <div class="status-item">
                            <div class="status-icon email ${this.statusData.email}"></div>
                            <div class="status-info">
                                <h4>Email Service</h4>
                                <p>${this.getStatusDescription(this.statusData.email)}</p>
                            </div>
                        </div>
                        <div class="status-item">
                            <div class="status-icon api ${this.statusData.api}"></div>
                            <div class="status-info">
                                <h4>API</h4>
                                <p>${this.getStatusDescription(this.statusData.api)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="status-footer">
                        <p><strong>Last Check:</strong> ${this.statusData.lastCheck ? this.statusData.lastCheck.toLocaleTimeString() : 'Never'}</p>
                        <button onclick="window.systemStatusMonitor.checkSystemStatus()" class="btn btn-primary">Refresh Status</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    getStatusDescription(status) {
        switch (status) {
            case 'healthy':
                return 'Operating normally';
            case 'degraded':
                return 'Performance issues detected';
            case 'down':
                return 'Service unavailable';
            default:
                return 'Status unknown';
        }
    }

    // Method to manually trigger status check
    async refreshStatus() {
        await this.checkSystemStatus();
    }

    // Cleanup method
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// Initialize system status monitor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.systemStatusMonitor = new SystemStatusMonitor();
});

// Export for use in other modules
window.SystemStatusMonitor = SystemStatusMonitor; 