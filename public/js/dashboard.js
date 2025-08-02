// Dashboard module for Blood Bank Management System

class DashboardManager {
    constructor() {
        this.activeTab = 'overview';
        this.currentUser = null;
        this.components = null;
        this.initializeComponents();
    }

    initializeComponents() {
        // Initialize enhanced dashboard components
        if (window.DashboardComponents) {
            this.components = new DashboardComponents();
        }
    }

    async loadDashboard(role, activeTab = 'overview') {
        this.currentUser = role;
        this.currentRole = role; // Add this line
        this.activeTab = activeTab;

        const container = document.getElementById('dashboardContainer');
        if (!container) return;

        loading.show('Loading dashboard...');

        try {
            // Load dashboard based on user role
            switch (role) {
                case CONFIG.USER_ROLES.DONOR:
                    await this.loadDonorDashboard();
                    break;
                case CONFIG.USER_ROLES.RECIPIENT:
                    await this.loadRecipientDashboard();
                    break;
                case CONFIG.USER_ROLES.ADMIN:
                    await this.loadAdminDashboard();
                    break;
                default:
                    throw new Error('Invalid user role');
            }

            // Set up auto-refresh
            this.setupAutoRefresh();
        } catch (error) {
            handleAPIError(error);
        } finally {
            loading.hide();
        }
    }

    async loadDonorDashboard() {
        const user = auth.getCurrentUser();
        console.log('🔍 Debug: Loading donor dashboard for user:', user);
        console.log('🔍 Debug: User role:', user.role);
        console.log('🔍 Debug: Auth token exists:', !!api.token);
        
        const container = document.getElementById('dashboardContainer');
        
        container.innerHTML = `
            <div class="dashboard-header">
                <div class="container">
                    <h1>Donor Dashboard</h1>
                    <p>Welcome back, ${auth.getCurrentUser().name}! Thank you for being a life-saver.</p>
                    <button class="btn btn-primary" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
            
            <div class="container">
                <div class="dashboard-nav">
                    <div class="dashboard-tab ${this.activeTab === 'overview' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('overview')">
                        <i class="fas fa-chart-pie"></i> Overview
                    </div>
                    <div class="dashboard-tab ${this.activeTab === 'donations' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('donations')">
                        <i class="fas fa-tint"></i> My Donations
                    </div>
                    <div class="dashboard-tab ${this.activeTab === 'new-donation' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('new-donation')">
                        <i class="fas fa-plus"></i> New Donation
                    </div>
                    <div class="dashboard-tab ${this.activeTab === 'profile' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('profile')">
                        <i class="fas fa-user-circle"></i> Profile
                    </div>
                </div>
                
                <div id="dashboardContent" class="dashboard-content">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        `;

        await this.loadDonorContent();
    }

    async loadRecipientDashboard() {
        const container = document.getElementById('dashboardContainer');
        
        container.innerHTML = `
            <div class="dashboard-header">
                <div class="container">
                    <h1>Recipient Dashboard</h1>
                    <p>Welcome, ${auth.getCurrentUser().name}! We're here to help you get the blood you need.</p>
                    <button class="btn btn-primary" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
            
            <div class="container">
                <div class="dashboard-nav">
                    <div class="dashboard-tab ${this.activeTab === 'overview' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('overview')">
                        <i class="fas fa-chart-pie"></i> Overview
                    </div>
                    <div class="dashboard-tab ${this.activeTab === 'requests' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('requests')">
                        <i class="fas fa-hand-holding-medical"></i> My Requests
                    </div>
                    <div class="dashboard-tab ${this.activeTab === 'new-request' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('new-request')">
                        <i class="fas fa-plus"></i> New Request
                    </div>
                    <div class="dashboard-tab ${this.activeTab === 'inventory' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('inventory')">
                        <i class="fas fa-warehouse"></i> Blood Availability
                    </div>
                    <div class="dashboard-tab ${this.activeTab === 'profile' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('profile')">
                        <i class="fas fa-user-circle"></i> Profile
                    </div>
                </div>
                
                <div id="dashboardContent" class="dashboard-content">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        `;

        await this.loadRecipientContent();
    }

    async loadAdminDashboard() {
        console.log('🔧 Loading admin dashboard...'); // Debug log
        const container = document.getElementById('dashboardContainer');
        
        if (!container) {
            console.error('❌ dashboardContainer not found!');
            return;
        }
        
        console.log('🔧 Setting admin dashboard HTML...'); // Debug log
        container.innerHTML = `
            <div class="dashboard-header">
                <div class="container">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome, ${auth.getCurrentUser().name}! Manage the blood bank system efficiently.</p>
                    <button class="btn btn-primary" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
            
            <div class="container">
                <div class="dashboard-nav">
                    <div class="dashboard-tab ${this.activeTab === 'overview' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('overview')">
                        <i class="fas fa-chart-line"></i> Analytics
                    </div>
                    <div class="dashboard-tab ${this.activeTab === 'donations' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('donations')">
                        <i class="fas fa-tint"></i> Donations
                    </div>
                    <div class="dashboard-tab ${this.activeTab === 'requests' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('requests')">
                        <i class="fas fa-hand-holding-medical"></i> Requests
                    </div>
                    <div class="dashboard-tab ${this.activeTab === 'inventory' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('inventory')">
                        <i class="fas fa-warehouse"></i> Inventory
                    </div>
                    <div class="dashboard-tab ${this.activeTab === 'users' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('users')">
                        <i class="fas fa-users"></i> Users
                    </div>
                    <div class="dashboard-tab ${this.activeTab === 'profile' ? 'active' : ''}" 
                         onclick="window.dashboardManager.switchTab('profile')">
                        <i class="fas fa-user-circle"></i> Profile
                    </div>
                </div>
                
                <div id="dashboardContent" class="dashboard-content">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        `;

        console.log('🔧 Calling loadAdminContent...'); // Debug log
        await this.loadAdminContent();
    }

    async switchTab(tabName) {
        console.log('🔍 Debug: Switching to tab:', tabName);
        console.log('🔍 Debug: Current role:', this.currentRole);
        
        this.activeTab = tabName;
        
        // Update active tab styling
        const allTabs = document.querySelectorAll('.dashboard-tab');
        console.log('🔍 Debug: Found tabs:', allTabs.length);
        
        allTabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Find and activate the correct tab
        const targetTab = document.querySelector(`[onclick*="${tabName}"]`);
        console.log('🔍 Debug: Target tab found:', !!targetTab);
        
        if (targetTab) {
            targetTab.classList.add('active');
        } else {
            console.warn('🔍 Debug: Target tab not found for:', tabName);
        }

        // Load content based on role and tab
        switch (this.currentRole) {
            case CONFIG.USER_ROLES.DONOR:
                console.log('🔍 Debug: Loading donor content for tab:', tabName);
                await this.loadDonorContent();
                break;
            case CONFIG.USER_ROLES.RECIPIENT:
                await this.loadRecipientContent();
                break;
            case CONFIG.USER_ROLES.ADMIN:
                console.log('🔧 About to call loadAdminContent()...'); // Debug log
                try {
                    await this.loadAdminContent();
                    console.log('🔧 loadAdminContent() completed successfully'); // Debug log
                } catch (error) {
                    console.error('❌ Error in loadAdminContent():', error); // Debug log
                }
                break;
            default:
                console.error('🔍 Debug: Unknown role:', this.currentRole);
        }
    }

    async loadDonorContent() {
        const content = document.getElementById('dashboardContent');
        if (!content) return;

        console.log('🔍 Debug: Loading donor content for tab:', this.activeTab);

        switch (this.activeTab) {
            case 'overview':
                await this.loadDonorOverview(content);
                break;
            case 'donations':
                console.log('🔍 Debug: About to load donor donations...');
                await this.loadDonorDonations(content);
                break;
            case 'new-donation':
                this.loadNewDonationForm(content);
                this.setupDonationFormHandler();
                break;
            case 'profile':
                await this.loadProfile(content);
                break;
        }
    }

    async loadRecipientContent() {
        const content = document.getElementById('dashboardContent');
        if (!content) return;

        switch (this.activeTab) {
            case 'overview':
                await this.loadRecipientOverview(content);
                break;
            case 'requests':
                await this.loadRecipientRequests(content);
                break;
            case 'new-request':
                this.loadNewRequestForm(content);
                this.setupRequestFormHandler();
                break;
            case 'inventory':
                await this.loadInventory(content);
                break;
            case 'profile':
                await this.loadProfile(content);
                break;
        }
    }

    async loadAdminContent() {
        console.log('🔧 Loading admin content for tab:', this.activeTab);
        const content = document.getElementById('dashboardContent');
        if (!content) return;

        switch (this.activeTab) {
            case 'overview':
                await this.loadSimpleAdminOverview(content);
                break;
            case 'donations':
                await this.loadSimpleAdminDonations(content);
                break;
            case 'requests':
                await this.loadSimpleAdminRequests(content);
                break;
            case 'inventory':
                await this.loadSimpleAdminInventory(content);
                break;
            case 'users':
                await this.loadSimpleAdminUsers(content);
                break;
            case 'profile':
                await this.loadProfile(content);
                break;
            default:
                content.innerHTML = '<div class="dashboard-card"><h3>Admin Dashboard</h3><p>Select a tab to view content.</p></div>';
        }
    }

    async loadDonorOverview(content) {
        try {
            content.innerHTML = '<div class="loading-spinner">Loading donor overview...</div>';
            
            const user = auth.getCurrentUser();
            
            const eligibilityResponse = await api.checkDonationEligibility();
            const donationsResponse = await api.getDonations({ limit: 5 });

            const eligibility = eligibilityResponse.data.eligibility;
            const recentDonations = donationsResponse.data.donations || [];

            content.innerHTML = `
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Donation Eligibility</h3>
                    </div>
                    <div class="eligibility-status ${eligibility.eligible ? 'eligible' : 'not-eligible'}">
                        <i class="fas ${eligibility.eligible ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        <div>
                            <h4>${eligibility.eligible ? 'You are eligible to donate!' : 'Not eligible at this time'}</h4>
                            <p>${eligibility.reason}</p>
                        </div>
                        ${eligibility.eligible ? '<button class="btn btn-primary" onclick="window.dashboardManager.switchTab(\'new-donation\')">Donate Now</button>' : ''}
                    </div>
                </div>

                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Recent Donations</h3>
                        <button class="btn btn-outline" onclick="window.dashboardManager.switchTab('donations')">View All</button>
                    </div>
                    <div class="donations-list">
                        ${recentDonations.length > 0 ? 
                            recentDonations.map(donation => `
                                <div class="donation-item">
                                    <div class="donation-info">
                                        <span class="blood-type">${donation.bloodType}</span>
                                        <span class="quantity">${donation.quantity}ml</span>
                                        <span class="date">${Utils.formatDate(donation.donationDate)}</span>
                                    </div>
                                    <span class="status ${Utils.getStatusClass(donation.status)}">${Utils.capitalize(donation.status)}</span>
                                </div>
                            `).join('') :
                            '<p class="no-data">No donations yet. Start saving lives today!</p>'
                        }
                    </div>
                </div>
            `;
        } catch (error) {
            handleAPIError(error);
        }
    }

    async loadRecipientOverview(content) {
        try {
            content.innerHTML = '<div class="loading-spinner">Loading recipient overview...</div>';
            
            const user = auth.getCurrentUser();
            
            const requestsResponse = await api.getRequests({ limit: 5 });

            const recentRequests = requestsResponse.data.requests || [];

            content.innerHTML = `
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Recent Requests</h3>
                        <button class="btn btn-outline" onclick="window.dashboardManager.switchTab('requests')">View All</button>
                    </div>
                    <div class="requests-list">
                        ${recentRequests.length > 0 ? 
                            recentRequests.map(request => `
                                <div class="request-item">
                                    <div class="request-info">
                                        <span class="blood-type">${request.bloodType}</span>
                                        <span class="quantity">${request.quantity} units</span>
                                        <span class="urgency ${Utils.getUrgencyClass(request.urgency)}">${Utils.capitalize(request.urgency)}</span>
                                    </div>
                                    <span class="status ${Utils.getStatusClass(request.status)}">${Utils.capitalize(request.status)}</span>
                                </div>
                            `).join('') :
                            '<p class="no-data">No requests yet. Create your first blood request!</p>'
                        }
                    </div>
                </div>

                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Quick Actions</h3>
                    </div>
                    <div class="quick-actions">
                        <button class="btn btn-primary" onclick="window.dashboardManager.switchTab('new-request')">
                            <i class="fas fa-plus"></i> New Blood Request
                        </button>
                        <button class="btn btn-outline" onclick="window.dashboardManager.switchTab('inventory')">
                            <i class="fas fa-warehouse"></i> Check Blood Availability
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            handleAPIError(error);
        }
    }

    async loadRecipientRequests(content) {
        try {
            content.innerHTML = `
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">My Blood Requests</h3>
                        <button class="btn btn-primary" onclick="window.dashboardManager.switchTab('new-request')">New Request</button>
                    </div>
                    <div class="requests-container">
                        <p>Loading your requests...</p>
                    </div>
                </div>
            `;

            // Load actual requests data
            const requestsResponse = await api.getRequests();
            const requests = requestsResponse.data.requests || [];

            const requestsContainer = content.querySelector('.requests-container');
            
            if (requests.length > 0) {
                requestsContainer.innerHTML = `
                    <div class="requests-list">
                        ${requests.map(request => `
                            <div class="request-item">
                                <div class="request-header">
                                    <div class="request-info">
                                        <span class="blood-type">${request.bloodType}</span>
                                        <span class="quantity">${request.quantity} units</span>
                                        <span class="urgency ${Utils.getUrgencyClass(request.urgency)}">${Utils.capitalize(request.urgency)}</span>
                                    </div>
                                    <span class="status ${Utils.getStatusClass(request.status)}">${Utils.capitalize(request.status)}</span>
                                </div>
                                <div class="request-details">
                                    <p><strong>Hospital:</strong> ${request.hospital || 'Not specified'}</p>
                                    <p><strong>Required By:</strong> ${new Date(request.requiredBy).toLocaleDateString()}</p>
                                    <p><strong>Reason:</strong> ${request.reason || 'Not specified'}</p>
                                    <p><strong>Submitted:</strong> ${new Date(request.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                requestsContainer.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-clipboard-list"></i>
                        <p>No blood requests found.</p>
                        <p>Create your first blood request to get started!</p>
                        <button class="btn btn-primary" onclick="window.dashboardManager.switchTab('new-request')">
                            <i class="fas fa-plus"></i> Create New Request
                        </button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading recipient requests:', error);
            const requestsContainer = content.querySelector('.requests-container');
            requestsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load requests. Please try again.</p>
                    <button class="btn btn-outline" onclick="window.dashboardManager.loadRecipientRequests(document.getElementById('dashboardContent'))">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    loadNewRequestForm(content) {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-header">
                    <h3 class="card-title">New Blood Request</h3>
                </div>
                <form id="newRequestForm" class="dashboard-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="requestBloodType">Blood Type Required</label>
                            <select id="requestBloodType" required>
                                <option value="">Select Blood Type</option>
                                ${CONFIG.BLOOD_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="requestQuantity">Quantity (units)</label>
                            <input type="number" id="requestQuantity" min="1" max="10" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="requestUrgency">Urgency Level</label>
                            <select id="requestUrgency" required>
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="requestRequiredBy">Required By Date</label>
                            <input type="date" id="requestRequiredBy" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="requestReason">Reason for Request</label>
                        <textarea id="requestReason" rows="4" required placeholder="Please describe why you need blood (minimum 10 characters)..."></textarea>
                        <small class="form-help">Please provide a detailed reason (10-500 characters)</small>
                    </div>
                    <div class="form-group">
                        <label for="requestHospital">Hospital Name</label>
                        <input type="text" id="requestHospital" required>
                    </div>
                    <div class="form-group">
                        <label for="requestContact">Hospital Contact</label>
                        <input type="tel" id="requestContact" required placeholder="Enter 10-15 digit phone number">
                        <small class="form-help">Enter 10-15 digits only (e.g., 1234567890)</small>
                    </div>
                    <button type="submit" class="btn btn-primary">Submit Request</button>
                </form>
            </div>
        `;
    }

    async loadInventory(content) {
        try {
            const inventoryResponse = await api.getInventory();
            const inventory = inventoryResponse.data.inventory;

            content.innerHTML = `
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Blood Inventory</h3>
                    </div>
                    <div class="inventory-grid">
                        ${inventory.map(item => `
                            <div class="inventory-item ${item.stockStatus}">
                                <div class="blood-type">${item.bloodType}</div>
                                <div class="stock-info">
                                    <span class="units">${item.availableUnits} units</span>
                                    <span class="status">${Utils.capitalize(item.stockStatus)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            handleAPIError(error);
        }
    }











    async loadDonorDonations(content) {
        try {
            content.innerHTML = `
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">My Donations</h3>
                    </div>
                    <div class="donations-container">
                        <p>Loading your donations...</p>
                    </div>
                </div>
            `;
            
            console.log('🔍 Debug: Starting to fetch donations...');
            console.log('🔍 Debug: Current user token:', api.token ? 'Token exists' : 'No token');
            
            const donationsResponse = await api.getDonations();
            console.log('🔍 Debug: Donations response:', donationsResponse);
            
            const donations = donationsResponse.data.donations || [];
            console.log('🔍 Debug: Found donations:', donations.length);
            
            const donationsContainer = content.querySelector('.donations-container');
            
            if (donations.length > 0) {
                console.log('🔍 Debug: Displaying donations:', donations);
                donationsContainer.innerHTML = `
                    <div class="donations-list">
                        ${donations.map(donation => `
                            <div class="donation-item">
                                <div class="donation-header">
                                    <h4>Donation #${donation._id.slice(-6)}</h4>
                                    <span class="donation-status ${donation.status.toLowerCase()}">${donation.status}</span>
                                </div>
                                <div class="donation-details">
                                    <div class="detail-row">
                                        <span class="label">Blood Type:</span>
                                        <span class="value">${donation.bloodType}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Donation Date:</span>
                                        <span class="value">${new Date(donation.donationDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Expiry Date:</span>
                                        <span class="value">${donation.expiryDate ? new Date(donation.expiryDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Quantity:</span>
                                        <span class="value">${donation.quantity}ml</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Location:</span>
                                        <span class="value">${donation.location.bloodBank || donation.location}</span>
                                    </div>
                                    ${donation.notes ? `
                                        <div class="detail-row">
                                            <span class="label">Notes:</span>
                                            <span class="value">${donation.notes}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                console.log('🔍 Debug: No donations found, showing empty state');
                donationsContainer.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-tint"></i>
                        <h4>No Donations Yet</h4>
                        <p>You haven't made any blood donations yet. Schedule your first donation to get started!</p>
                        <button class="btn btn-primary" onclick="window.dashboardManager.switchTab('new-donation')">Schedule Donation</button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Error loading donations:', error);
            const donationsContainer = content.querySelector('.donations-container');
            donationsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Error Loading Donations</h4>
                    <p>Failed to load your donation history. Error: ${error.message}</p>
                    <button class="btn btn-primary" onclick="window.dashboardManager.refreshCurrentContent()">Retry</button>
                </div>
            `;
        }
    }

    loadNewDonationForm(content) {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-header">
                    <h3 class="card-title">Schedule New Donation</h3>
                </div>
                <form id="newDonationForm" class="dashboard-form">
                    <div class="form-group">
                        <label for="donationDate">Preferred Donation Date</label>
                        <input type="date" id="donationDate" required>
                    </div>
                    <div class="form-group">
                        <label for="donationLocation">Blood Bank Location</label>
                        <input type="text" id="donationLocation" required>
                    </div>
                    <div class="form-group">
                        <label for="donationNotes">Additional Notes</label>
                        <textarea id="donationNotes" rows="3" placeholder="Any special requirements or notes..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Schedule Donation</button>
                </form>
            </div>
        `;
    }

    async loadProfile(content) {
        try {
            // Create profile content container
            content.innerHTML = '<div id="profile-content"></div>';
            
            // Ensure profile manager is initialized
            if (!window.profileManager) {
                window.profileManager = new ProfileManager();
            }
            
            // Load current user data and render profile
            await window.profileManager.loadCurrentUser();
            window.profileManager.renderProfile();
            
        } catch (error) {
            console.error('Error loading profile:', error);
            content.innerHTML = `
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-user-circle"></i>
                            Profile Management
                        </h3>
                    </div>
                    <div class="profile-content">
                        <div class="error-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Failed to load profile. Please try again.</p>
                            <button class="btn btn-outline" onclick="window.dashboardManager.switchTab('profile')">
                                <i class="fas fa-redo"></i> Retry
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    setupDonationFormHandler() {
        const form = document.getElementById('newDonationForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const donationDate = document.getElementById('donationDate').value;
            const donationLocation = document.getElementById('donationLocation').value;
            
            // Validation
            if (!donationDate) {
                toast.error('Please select a donation date');
                return;
            }
            
            if (!donationLocation) {
                toast.error('Please enter a blood bank location');
                return;
            }
            
            // Check if date is in the future
            const selectedDate = new Date(donationDate);
            const today = new Date();
            if (selectedDate <= today) {
                toast.error('Donation date must be in the future');
                return;
            }
            
            const formData = {
                donationDate: donationDate,
                location: {
                    bloodBank: donationLocation,
                    address: {
                        street: 'TBD',
                        city: 'TBD',
                        state: 'TBD',
                        zipCode: 'TBD'
                    }
                },
                quantity: 450, // Default quantity
                notes: document.getElementById('donationNotes').value
            };

            console.log('🔍 Debug: Donation form data:', formData);

            loading.show('Scheduling donation...');

            try {
                console.log('🔍 Debug: Sending donation data to API...');
                const response = await api.createDonation(formData);
                console.log('🔍 Debug: API response:', response);
                
                if (response.success) {
                    toast.success('Donation scheduled successfully!');
                    form.reset();
                    this.switchTab('donations');
                }
            } catch (error) {
                console.error('❌ Debug: Donation creation error:', error);
                handleAPIError(error);
            } finally {
                loading.hide();
            }
        });
    }

    setupRequestFormHandler() {
        const form = document.getElementById('newRequestForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const bloodType = document.getElementById('requestBloodType').value;
            const quantity = parseInt(document.getElementById('requestQuantity').value);
            const urgency = document.getElementById('requestUrgency').value;
            const requiredBy = document.getElementById('requestRequiredBy').value;
            const reason = document.getElementById('requestReason').value.trim();
            const hospitalName = document.getElementById('requestHospital').value.trim();
            const hospitalContact = document.getElementById('requestContact').value.trim();
            
            // Enhanced validation
            if (!bloodType) {
                toast.error('Please select a blood type');
                return;
            }
            
            if (!quantity || quantity < 1 || quantity > 10) {
                toast.error('Quantity must be between 1 and 10 units');
                return;
            }
            
            if (!requiredBy) {
                toast.error('Please select a required by date');
                return;
            }
            
            // Check reason length (backend requires 10-500 characters)
            if (!reason || reason.length < 10) {
                toast.error('Reason must be at least 10 characters long');
                return;
            }
            
            if (reason.length > 500) {
                toast.error('Reason cannot exceed 500 characters');
                return;
            }
            
            if (!hospitalName) {
                toast.error('Please enter hospital name');
                return;
            }
            
            if (!hospitalContact) {
                toast.error('Please enter hospital contact number');
                return;
            }
            
            // Validate phone number format (10-15 digits)
            const phoneDigits = hospitalContact.replace(/\D/g, '');
            if (phoneDigits.length < 10 || phoneDigits.length > 15) {
                toast.error('Hospital contact number must be 10-15 digits');
                return;
            }
            
            // Check if required by date is in the future
            const requiredDate = new Date(requiredBy);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            if (requiredDate <= today) {
                toast.error('Required by date must be in the future');
                return;
            }
            
            const formData = {
                bloodType: bloodType,
                quantity: quantity,
                urgency: urgency,
                requiredBy: requiredBy,
                reason: reason,
                hospital: {
                    name: hospitalName,
                    contactNumber: phoneDigits, // Use cleaned digits
                    address: {
                        street: 'TBD',
                        city: 'TBD',
                        state: 'TBD',
                        zipCode: 'TBD'
                    }
                }
            };

            console.log('Submitting request data:', formData); // Debug log

            loading.show('Creating blood request...');

            try {
                const response = await api.createRequest(formData);
                
                if (response.success) {
                    toast.success('Blood request created successfully!');
                    form.reset();
                    this.switchTab('requests');
                }
            } catch (error) {
                console.error('Request creation error:', error);
                
                // Handle validation errors specifically
                if (error.response && error.response.data && error.response.data.errors) {
                    const validationErrors = error.response.data.errors;
                    const errorMessages = validationErrors.map(err => `${err.path}: ${err.msg}`).join(', ');
                    toast.error(`Validation failed: ${errorMessages}`);
                } else if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                } else {
                    handleAPIError(error);
                }
            } finally {
                loading.hide();
            }
        });
    }

    setupAutoRefresh() {
        // Clear existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Set up new interval based on current tab
        const interval = this.activeTab === 'overview' ? 
            CONFIG.REFRESH_INTERVALS.DASHBOARD : 
            CONFIG.REFRESH_INTERVALS.INVENTORY;

        this.refreshInterval = setInterval(() => {
            this.refreshCurrentContent();
        }, interval);
    }

    async refreshCurrentContent() {
        try {
            // Only refresh if dashboard is visible
            const container = document.getElementById('dashboardContainer');
            if (!container || container.style.display === 'none') return;

            // Refresh based on current role and tab
            switch (this.currentRole) {
                case CONFIG.USER_ROLES.DONOR:
                    await this.loadDonorContent();
                    break;
                case CONFIG.USER_ROLES.RECIPIENT:
                    await this.loadRecipientContent();
                    break;
                case CONFIG.USER_ROLES.ADMIN:
                    await this.loadAdminContent();
                    break;
            }
        } catch (error) {
            console.error('Auto-refresh error:', error);
        }
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    async approveRequest(requestId) {
        try {
            const response = await api.approveRequest(requestId);
            
            if (response.success) {
                toast.success('Request approved successfully!');
                // Refresh the requests list
                await this.switchTab('requests');
            } else {
                toast.error(response.message || 'Failed to approve request');
            }
        } catch (error) {
            console.error('Error approving request:', error);
            toast.error('Failed to approve request. Please try again.');
        }
    }

    async rejectRequest(requestId) {
        this.showRejectionModal(requestId);
    }

    showRejectionModal(requestId) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Reject Blood Request</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="rejectionForm">
                        <div class="form-group">
                            <label for="rejectionReason">Rejection Reason *</label>
                            <textarea 
                                id="rejectionReason" 
                                rows="4" 
                                required 
                                placeholder="Please provide a reason for rejecting this request..."
                            ></textarea>
                            <small class="form-help">This reason will be shared with the requester</small>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-danger">
                                <i class="fas fa-times"></i> Reject Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        const form = modal.querySelector('#rejectionForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const reason = modal.querySelector('#rejectionReason').value.trim();
            
            if (!reason) {
                toast.error('Please provide a rejection reason');
                return;
            }

            try {
                const response = await api.rejectRequest(requestId, reason);
                
                if (response.success) {
                    toast.success('Request rejected successfully');
                    modal.remove();
                    // Refresh the requests list
                    await this.switchTab('requests');
                } else {
                    toast.error(response.message || 'Failed to reject request');
                }
            } catch (error) {
                console.error('Error rejecting request:', error);
                toast.error('Failed to reject request. Please try again.');
            }
        });

        // Focus on the textarea
        setTimeout(() => {
            modal.querySelector('#rejectionReason').focus();
        }, 100);
    }

    // Simplified Admin Content Methods
    async loadSimpleAdminOverview(content) {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-header">
                    <h3 class="card-title">Admin Dashboard Overview</h3>
                </div>
                <div class="admin-stats">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-content">
                                <h4>25</h4>
                                <p>Total Users</p>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon">
                                <i class="fas fa-tint"></i>
                            </div>
                            <div class="stat-content">
                                <h4>150</h4>
                                <p>Total Donations</p>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon">
                                <i class="fas fa-heartbeat"></i>
                            </div>
                            <div class="stat-content">
                                <h4>75</h4>
                                <p>Total Requests</p>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon">
                                <i class="fas fa-warehouse"></i>
                            </div>
                            <div class="stat-content">
                                <h4>8</h4>
                                <p>Blood Types</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadSimpleAdminDonations(content) {
        try {
            content.innerHTML = '<div class="loading-spinner">Loading donations...</div>';
            
            // Fetch all donations from the API
            const response = await api.getDonations();
            const donations = response.data.donations || [];
            
            if (donations.length === 0) {
                content.innerHTML = `
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3 class="card-title">Manage Donations</h3>
                        </div>
                        <div class="donations-container">
                            <div class="no-data">
                                <i class="fas fa-tint"></i>
                                <p>No donations found</p>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }
            
            const donationsHtml = donations.map(donation => `
                <div class="donation-item ${donation.status}" data-donation-id="${donation._id}">
                    <div class="donation-header">
                        <div class="donation-info">
                            <h4>${donation.donor.name}</h4>
                            <p class="donation-meta">
                                <span class="blood-type">${donation.bloodType}</span>
                                <span class="units">${donation.units} units</span>
                                <span class="status ${donation.status}">${donation.status}</span>
                            </p>
                        </div>
                        <div class="donation-status">
                            <span class="status-badge ${donation.status}">${donation.status}</span>
                        </div>
                    </div>
                    <div class="donation-details">
                        <p><strong>Donation Date:</strong> ${new Date(donation.donationDate).toLocaleDateString()}</p>
                        <p><strong>Expiry Date:</strong> ${new Date(donation.expiryDate).toLocaleDateString()}</p>
                        <p><strong>Location:</strong> ${donation.location.bloodBank}</p>
                        <p><strong>Notes:</strong> ${donation.notes || 'No notes'}</p>
                    </div>
                </div>
            `).join('');
            
            content.innerHTML = `
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Manage Donations</h3>
                        <div class="card-actions">
                            <span class="donation-count">${donations.length} donations</span>
                        </div>
                    </div>
                    <div class="donations-container">
                        <div class="donations-list">
                            ${donationsHtml}
                        </div>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading admin donations:', error);
            content.innerHTML = `
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Manage Donations</h3>
                    </div>
                    <div class="donations-container">
                        <div class="error-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Failed to load donations. Please try again.</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    async loadSimpleAdminRequests(content) {
        try {
            content.innerHTML = '<div class="loading-spinner">Loading requests...</div>';
            
            // Fetch all requests from the API
            const response = await api.getRequests();
            const requests = response.data.requests || [];
            
            console.log('🔍 Debug: Fetched requests:', requests);
            
            if (requests.length === 0) {
                content.innerHTML = `
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3 class="card-title">Manage Requests</h3>
                        </div>
                        <div class="requests-container">
                            <div class="no-data">
                                <i class="fas fa-inbox"></i>
                                <p>No blood requests found</p>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }
            
            const requestsHtml = requests.map((request, index) => {
                console.log(`🔍 Debug: Processing request ${index}:`, request);
                
                // Add null checks for all properties
                const patientName = request.patientName || 'Unknown Patient';
                const bloodType = request.bloodType || 'Unknown';
                const units = request.units || 0;
                const urgency = request.urgency || 'medium';
                const status = request.status || 'pending';
                const reason = request.reason || 'No reason provided';
                const createdAt = request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Unknown date';
                
                // Handle hospital data safely
                const hospitalName = request.hospital?.name || 'Unknown Hospital';
                const hospitalContact = request.hospital?.contact || 'No contact provided';
                
                // Handle requester data safely
                const requesterName = request.requester?.name || 'Unknown Requester';
                
                console.log(`🔍 Debug: Processed request ${index} - patientName: ${patientName}, hospitalName: ${hospitalName}, requesterName: ${requesterName}`);
                
                return `
                    <div class="request-item ${status}" data-request-id="${request._id}">
                        <div class="request-header">
                            <div class="request-info">
                                <h4>${patientName}</h4>
                                <p class="request-meta">
                                    <span class="blood-type">${bloodType}</span>
                                    <span class="units">${units} units</span>
                                    <span class="urgency ${urgency}">${urgency}</span>
                                </p>
                            </div>
                            <div class="request-status">
                                <span class="status-badge ${status}">${status}</span>
                            </div>
                        </div>
                        <div class="request-details">
                            <p><strong>Hospital:</strong> ${hospitalName}</p>
                            <p><strong>Contact:</strong> ${hospitalContact}</p>
                            <p><strong>Reason:</strong> ${reason}</p>
                            <p><strong>Requested by:</strong> ${requesterName}</p>
                            <p><strong>Date:</strong> ${createdAt}</p>
                        </div>
                        ${status === 'pending' ? `
                            <div class="request-actions">
                                <button class="btn btn-success btn-sm" onclick="window.dashboardManager.approveRequest('${request._id}')">
                                    <i class="fas fa-check"></i> Approve
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="window.dashboardManager.showRejectionModal('${request._id}')">
                                    <i class="fas fa-times"></i> Reject
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
            
            content.innerHTML = `
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Manage Requests</h3>
                        <div class="card-actions">
                            <span class="request-count">${requests.length} requests</span>
                        </div>
                    </div>
                    <div class="requests-container">
                        <div class="requests-list">
                            ${requestsHtml}
                        </div>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading admin requests:', error);
            content.innerHTML = `
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Manage Requests</h3>
                    </div>
                    <div class="requests-container">
                        <div class="error-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Failed to load requests. Please try again.</p>
                            <p class="error-details">${error.message}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    async loadSimpleAdminInventory(content) {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-header">
                    <h3 class="card-title">Manage Inventory</h3>
                </div>
                <div class="inventory-container">
                    <p>Inventory management will be available soon.</p>
                </div>
            </div>
        `;
    }

    async loadSimpleAdminUsers(content) {
        content.innerHTML = `
            <div class="dashboard-card">
                <div class="card-header">
                    <h3 class="card-title">Manage Users</h3>
                </div>
                <div class="users-container">
                    <p>Users management will be available soon.</p>
                </div>
            </div>
        `;
    }

}



// Initialize dashboard manager
window.dashboardManager = new DashboardManager();

// Ensure dashboard manager is available globally
if (typeof window !== 'undefined') {
    window.dashboardManager = window.dashboardManager || new DashboardManager();
}
