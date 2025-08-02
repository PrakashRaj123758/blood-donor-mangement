// Enhanced Dashboard Components with Chart.js Integration
class DashboardComponents {
    constructor() {
        this.charts = {};
        this.loadChartJS();
    }

    // Load Chart.js library
    loadChartJS() {
        if (!window.Chart) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => {
                console.log('Chart.js loaded successfully');
            };
            document.head.appendChild(script);
        }
    }

    // Enhanced Donor Dashboard Components
    getDonorOverview() {
        return `
            <div class="dashboard-section">
                <h3><i class="fas fa-chart-line"></i> Donation Overview</h3>
                <div class="dashboard-stats">
                    <div class="stat-card primary">
                        <div class="stat-icon">🩸</div>
                        <div class="stat-content">
                            <h4>Total Donations</h4>
                            <p class="stat-number" id="donor-total-donations">Loading...</p>
                        </div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-icon">📅</div>
                        <div class="stat-content">
                            <h4>Last Donation</h4>
                            <p class="stat-number" id="donor-last-donation">Loading...</p>
                        </div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-icon">⏰</div>
                        <div class="stat-content">
                            <h4>Next Eligible</h4>
                            <p class="stat-number" id="donor-next-eligible">Loading...</p>
                        </div>
                    </div>
                    <div class="stat-card info">
                        <div class="stat-icon">🅰️</div>
                        <div class="stat-content">
                            <h4>Blood Type</h4>
                            <p class="stat-number" id="donor-blood-type">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3><i class="fas fa-heart"></i> Your Impact</h3>
                <div class="impact-container">
                    <div class="impact-visual">
                        <canvas id="donorImpactChart" width="300" height="200"></canvas>
                    </div>
                    <div class="impact-stats">
                        <div class="impact-item">
                            <span class="impact-number" id="lives-potentially-saved">0</span>
                            <span class="impact-label">Lives Potentially Saved</span>
                        </div>
                        <div class="impact-item">
                            <span class="impact-number" id="total-blood-volume">0 ml</span>
                            <span class="impact-label">Total Blood Donated</span>
                        </div>
                        <div class="impact-item">
                            <span class="impact-number" id="donation-streak">0</span>
                            <span class="impact-label">Donation Streak</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3><i class="fas fa-clock"></i> Recent Activity</h3>
                <div id="donor-recent-activity" class="activity-timeline">
                    <div class="loading-spinner">Loading recent activity...</div>
                </div>
            </div>
        `;
    }

    getDonorActions() {
        return `
            <div class="dashboard-section">
                <h3><i class="fas fa-plus"></i> Quick Actions</h3>
                <div class="action-grid">
                    <button class="action-card" onclick="DashboardComponents.scheduleNewDonation()">
                        <div class="action-icon">🗓️</div>
                        <h4>Schedule Donation</h4>
                        <p>Book your next donation appointment</p>
                    </button>
                    <button class="action-card" onclick="DashboardComponents.checkEligibility()">
                        <div class="action-icon">✅</div>
                        <h4>Check Eligibility</h4>
                        <p>Verify if you can donate today</p>
                    </button>
                    <button class="action-card" onclick="DashboardComponents.viewCertificates()">
                        <div class="action-icon">🏆</div>
                        <h4>View Certificates</h4>
                        <p>Download donation certificates</p>
                    </button>
                    <button class="action-card" onclick="DashboardComponents.findBloodDrives()">
                        <div class="action-icon">📍</div>
                        <h4>Find Blood Drives</h4>
                        <p>Locate nearby donation events</p>
                    </button>
                </div>
            </div>
        `;
    }

    // Enhanced Recipient Dashboard Components
    getRecipientOverview() {
        return `
            <div class="dashboard-section">
                <h3><i class="fas fa-chart-bar"></i> Request Overview</h3>
                <div class="dashboard-stats">
                    <div class="stat-card primary">
                        <div class="stat-icon">📋</div>
                        <div class="stat-content">
                            <h4>Active Requests</h4>
                            <p class="stat-number" id="recipient-active-requests">Loading...</p>
                        </div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-icon">✅</div>
                        <div class="stat-content">
                            <h4>Fulfilled Requests</h4>
                            <p class="stat-number" id="recipient-fulfilled-requests">Loading...</p>
                        </div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-icon">⏳</div>
                        <div class="stat-content">
                            <h4>Pending Approval</h4>
                            <p class="stat-number" id="recipient-pending-requests">Loading...</p>
                        </div>
                    </div>
                    <div class="stat-card info">
                        <div class="stat-icon">🅰️</div>
                        <div class="stat-content">
                            <h4>Blood Type</h4>
                            <p class="stat-number" id="recipient-blood-type">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3><i class="fas fa-warehouse"></i> Blood Availability</h3>
                <div class="availability-container">
                    <div class="availability-chart">
                        <canvas id="bloodAvailabilityChart" width="400" height="200"></canvas>
                    </div>
                    <div class="compatibility-info">
                        <h4>Compatible Blood Types</h4>
                        <div id="compatible-blood-types" class="blood-type-grid">
                            <div class="loading-spinner">Loading compatibility...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getRecipientActions() {
        return `
            <div class="dashboard-section">
                <h3><i class="fas fa-plus"></i> Request Management</h3>
                <div class="action-grid">
                    <button class="action-card urgent" onclick="DashboardComponents.createUrgentRequest()">
                        <div class="action-icon">🚨</div>
                        <h4>Urgent Request</h4>
                        <p>Submit critical blood request</p>
                    </button>
                    <button class="action-card" onclick="DashboardComponents.createNormalRequest()">
                        <div class="action-icon">📝</div>
                        <h4>New Request</h4>
                        <p>Submit standard blood request</p>
                    </button>
                    <button class="action-card" onclick="DashboardComponents.trackRequests()">
                        <div class="action-icon">📊</div>
                        <h4>Track Requests</h4>
                        <p>Monitor request status</p>
                    </button>
                    <button class="action-card" onclick="DashboardComponents.findNearbyBanks()">
                        <div class="action-icon">🗺️</div>
                        <h4>Find Blood Banks</h4>
                        <p>Locate nearby blood banks</p>
                    </button>
                </div>
            </div>
        `;
    }

    // Enhanced Admin Dashboard Components
    getAdminOverview() {
        return `
            <div class="dashboard-section">
                <h3><i class="fas fa-tachometer-alt"></i> System Overview</h3>
                <div class="dashboard-stats">
                    <div class="stat-card primary">
                        <div class="stat-icon">👥</div>
                        <div class="stat-content">
                            <h4>Total Users</h4>
                            <p class="stat-number" id="admin-total-users">Loading...</p>
                        </div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-icon">🩸</div>
                        <div class="stat-content">
                            <h4>Total Donations</h4>
                            <p class="stat-number" id="admin-total-donations">Loading...</p>
                        </div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-icon">📋</div>
                        <div class="stat-content">
                            <h4>Pending Requests</h4>
                            <p class="stat-number" id="admin-pending-requests">Loading...</p>
                        </div>
                    </div>
                    <div class="stat-card danger">
                        <div class="stat-icon">⚠️</div>
                        <div class="stat-content">
                            <h4>Low Stock Alerts</h4>
                            <p class="stat-number" id="admin-low-stock">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3><i class="fas fa-chart-pie"></i> Analytics Dashboard</h3>
                <div class="analytics-container">
                    <div class="chart-container">
                        <h4>Blood Type Distribution</h4>
                        <canvas id="bloodTypeChart" width="300" height="200"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>Monthly Donations Trend</h4>
                        <canvas id="donationTrendChart" width="300" height="200"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>Request Status Distribution</h4>
                        <canvas id="requestStatusChart" width="300" height="200"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>Inventory Levels</h4>
                        <canvas id="inventoryChart" width="300" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    getAdminActions() {
        return `
            <div class="dashboard-section">
                <h3><i class="fas fa-cogs"></i> Administrative Actions</h3>
                <div class="action-grid">
                    <button class="action-card" onclick="DashboardComponents.manageUsers()">
                        <div class="action-icon">👥</div>
                        <h4>Manage Users</h4>
                        <p>View and manage user accounts</p>
                    </button>
                    <button class="action-card" onclick="DashboardComponents.approveDonations()">
                        <div class="action-icon">✅</div>
                        <h4>Approve Donations</h4>
                        <p>Review pending donations</p>
                    </button>
                    <button class="action-card" onclick="DashboardComponents.manageRequests()">
                        <div class="action-icon">📋</div>
                        <h4>Manage Requests</h4>
                        <p>Process blood requests</p>
                    </button>
                    <button class="action-card" onclick="DashboardComponents.inventoryManagement()">
                        <div class="action-icon">📦</div>
                        <h4>Inventory Control</h4>
                        <p>Manage blood inventory</p>
                    </button>
                    <button class="action-card" onclick="DashboardComponents.generateReports()">
                        <div class="action-icon">📊</div>
                        <h4>Generate Reports</h4>
                        <p>Create system reports</p>
                    </button>
                    <button class="action-card" onclick="DashboardComponents.systemSettings()">
                        <div class="action-icon">⚙️</div>
                        <h4>System Settings</h4>
                        <p>Configure system parameters</p>
                    </button>
                </div>
            </div>
        `;
    }

    // Chart Creation Methods
    createDonorImpactChart(data) {
        const ctx = document.getElementById('donorImpactChart');
        if (!ctx || !window.Chart) return;

        this.charts.donorImpact = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Lives Saved', 'Potential Impact'],
                datasets: [{
                    data: [data.livesSaved || 0, data.potentialImpact || 0],
                    backgroundColor: ['#e74c3c', '#f39c12'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createBloodAvailabilityChart(data) {
        const ctx = document.getElementById('bloodAvailabilityChart');
        if (!ctx || !window.Chart) return;

        this.charts.bloodAvailability = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
                datasets: [{
                    label: 'Available Units',
                    data: data.availability || [0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: '#3498db',
                    borderColor: '#2980b9',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createAdminCharts(data) {
        // Blood Type Distribution Chart
        const bloodTypeCtx = document.getElementById('bloodTypeChart');
        if (bloodTypeCtx && window.Chart) {
            this.charts.bloodType = new Chart(bloodTypeCtx, {
                type: 'pie',
                data: {
                    labels: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
                    datasets: [{
                        data: data.bloodTypeDistribution || [12, 8, 15, 6, 10, 4, 35, 10],
                        backgroundColor: [
                            '#e74c3c', '#c0392b', '#f39c12', '#e67e22',
                            '#9b59b6', '#8e44ad', '#3498db', '#2980b9'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }

        // Donation Trend Chart
        const trendCtx = document.getElementById('donationTrendChart');
        if (trendCtx && window.Chart) {
            this.charts.donationTrend = new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Donations',
                        data: data.monthlyDonations || [65, 59, 80, 81, 56, 55],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Request Status Chart
        const statusCtx = document.getElementById('requestStatusChart');
        if (statusCtx && window.Chart) {
            this.charts.requestStatus = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Pending', 'Approved', 'Fulfilled', 'Rejected'],
                    datasets: [{
                        data: data.requestStatus || [15, 25, 45, 5],
                        backgroundColor: ['#f39c12', '#3498db', '#27ae60', '#e74c3c']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Inventory Chart
        const inventoryCtx = document.getElementById('inventoryChart');
        if (inventoryCtx && window.Chart) {
            this.charts.inventory = new Chart(inventoryCtx, {
                type: 'bar',
                data: {
                    labels: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
                    datasets: [{
                        label: 'Current Stock',
                        data: data.currentStock || [25, 15, 20, 8, 12, 5, 35, 18],
                        backgroundColor: '#27ae60'
                    }, {
                        label: 'Minimum Required',
                        data: data.minRequired || [20, 10, 15, 10, 10, 8, 30, 15],
                        backgroundColor: '#e74c3c'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // Action Methods
    static scheduleNewDonation() {
        if (window.dashboardManager) {
            window.dashboardManager.switchTab('new-donation');
        }
    }

    static checkEligibility() {
        if (window.dashboardManager) {
            window.dashboardManager.switchTab('overview');
        }
    }

    static createUrgentRequest() {
        if (window.dashboardManager) {
            window.dashboardManager.switchTab('new-request');
        }
    }

    static manageUsers() {
        if (window.dashboardManager) {
            window.dashboardManager.switchTab('users');
        }
    }

    // Utility method to destroy all charts
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// Export for use in other modules
window.DashboardComponents = DashboardComponents;
