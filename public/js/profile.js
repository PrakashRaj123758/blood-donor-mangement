// Profile Management Component for Blood Bank Management System

class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.isEditing = false;
        this.originalData = null;
        this.initialize();
    }

    initialize() {
        console.log('👤 Initializing Profile Manager...');
        this.loadCurrentUser();
        this.setupEventListeners();
    }

    async loadCurrentUser() {
        try {
            const user = window.auth?.getCurrentUser();
            if (user) {
                this.currentUser = user;
                this.originalData = { ...user };
                this.renderProfile();
            }
        } catch (error) {
            console.error('Failed to load current user:', error);
        }
    }

    setupEventListeners() {
        // Listen for profile update events
        document.addEventListener('profileUpdated', (e) => {
            this.currentUser = e.detail.user;
            this.originalData = { ...this.currentUser };
            this.renderProfile();
            this.showSuccessMessage('Profile updated successfully!');
        });

        // Listen for form auto-save
        document.addEventListener('formAutoSave', (e) => {
            if (e.detail.formId === 'profile-form') {
                this.autoSaveProfile();
            }
        });
    }

    renderProfile() {
        const profileContainer = document.getElementById('profile-content');
        if (!profileContainer) return;

        if (!this.currentUser) {
            profileContainer.innerHTML = `
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Profile</h3>
                    </div>
                    <div class="profile-content">
                        <p>Please log in to view your profile.</p>
                    </div>
                </div>
            `;
            return;
        }

        const isEditing = this.isEditing;
        const user = this.currentUser;

        profileContainer.innerHTML = `
            <div class="dashboard-card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-user-circle"></i>
                        Profile Management
                    </h3>
                    <div class="card-actions">
                        ${!isEditing ? `
                            <button class="btn btn-primary" onclick="window.profileManager.startEditing()">
                                <i class="fas fa-edit"></i> Edit Profile
                            </button>
                        ` : `
                            <button class="btn btn-outline" onclick="window.profileManager.cancelEditing()">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                            <button class="btn btn-primary" onclick="window.profileManager.saveProfile()">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                        `}
                    </div>
                </div>
                <div class="profile-content">
                    ${isEditing ? this.renderEditForm() : this.renderProfileView()}
                </div>
            </div>

            <div class="dashboard-card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-shield-alt"></i>
                        Account Security
                    </h3>
                </div>
                <div class="security-content">
                    ${this.renderSecuritySection()}
                </div>
            </div>

            <div class="dashboard-card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-chart-line"></i>
                        Activity Summary
                    </hh3>
                </div>
                <div class="activity-content">
                    ${this.renderActivitySummary()}
                </div>
            </div>
        `;

        // Initialize form auto-save if editing
        if (isEditing) {
            this.initializeFormAutoSave();
        }
    }

    renderProfileView() {
        const user = this.currentUser;
        return `
            <div class="profile-view">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="profile-info">
                        <h4>${user.name || 'User'}</h4>
                        <p class="user-email">${user.email}</p>
                        <span class="user-role">${this.capitalizeFirst(user.role)}</span>
                    </div>
                </div>
                
                <div class="profile-details">
                    <div class="detail-group">
                        <label>Full Name</label>
                        <p>${user.name || 'Not provided'}</p>
                    </div>
                    
                    <div class="detail-group">
                        <label>Email Address</label>
                        <p>${user.email}</p>
                    </div>
                    
                    <div class="detail-group">
                        <label>Phone Number</label>
                        <p>${user.phone || 'Not provided'}</p>
                    </div>
                    
                    <div class="detail-group">
                        <label>Blood Type</label>
                        <p>${user.bloodType || 'Not specified'}</p>
                    </div>
                    
                    <div class="detail-group">
                        <label>Date of Birth</label>
                        <p>${user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                    </div>
                    
                    <div class="detail-group">
                        <label>Address</label>
                        <p>${user.address || 'Not provided'}</p>
                    </div>
                    
                    <div class="detail-group">
                        <label>Emergency Contact</label>
                        <p>${user.emergencyContact || 'Not provided'}</p>
                    </div>
                    
                    <div class="detail-group">
                        <label>Medical Conditions</label>
                        <p>${user.medicalConditions || 'None reported'}</p>
                    </div>
                    
                    <div class="detail-group">
                        <label>Member Since</label>
                        <p>${new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div class="detail-group">
                        <label>Last Login</label>
                        <p>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderEditForm() {
        const user = this.currentUser;
        return `
            <form id="profile-form" class="profile-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="name">Full Name *</label>
                        <input type="text" id="name" name="name" value="${user.name || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email Address *</label>
                        <input type="email" id="email" name="email" value="${user.email}" required readonly>
                        <small>Email cannot be changed</small>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone" value="${user.phone || ''}" placeholder="+1 (555) 123-4567">
                    </div>
                    
                    <div class="form-group">
                        <label for="bloodType">Blood Type</label>
                        <select id="bloodType" name="bloodType">
                            <option value="">Select Blood Type</option>
                            <option value="A+" ${user.bloodType === 'A+' ? 'selected' : ''}>A+</option>
                            <option value="A-" ${user.bloodType === 'A-' ? 'selected' : ''}>A-</option>
                            <option value="B+" ${user.bloodType === 'B+' ? 'selected' : ''}>B+</option>
                            <option value="B-" ${user.bloodType === 'B-' ? 'selected' : ''}>B-</option>
                            <option value="AB+" ${user.bloodType === 'AB+' ? 'selected' : ''}>AB+</option>
                            <option value="AB-" ${user.bloodType === 'AB-' ? 'selected' : ''}>AB-</option>
                            <option value="O+" ${user.bloodType === 'O+' ? 'selected' : ''}>O+</option>
                            <option value="O-" ${user.bloodType === 'O-' ? 'selected' : ''}>O-</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="dateOfBirth">Date of Birth</label>
                        <input type="date" id="dateOfBirth" name="dateOfBirth" value="${user.dateOfBirth || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="gender">Gender</label>
                        <select id="gender" name="gender">
                            <option value="">Select Gender</option>
                            <option value="male" ${user.gender === 'male' ? 'selected' : ''}>Male</option>
                            <option value="female" ${user.gender === 'female' ? 'selected' : ''}>Female</option>
                            <option value="other" ${user.gender === 'other' ? 'selected' : ''}>Other</option>
                            <option value="prefer-not-to-say" ${user.gender === 'prefer-not-to-say' ? 'selected' : ''}>Prefer not to say</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="address">Address</label>
                    <textarea id="address" name="address" rows="3" placeholder="Enter your full address">${user.address || ''}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="emergencyContact">Emergency Contact</label>
                        <input type="text" id="emergencyContact" name="emergencyContact" value="${user.emergencyContact || ''}" placeholder="Name and phone number">
                    </div>
                    
                    <div class="form-group">
                        <label for="emergencyContactPhone">Emergency Contact Phone</label>
                        <input type="tel" id="emergencyContactPhone" name="emergencyContactPhone" value="${user.emergencyContactPhone || ''}" placeholder="+1 (555) 123-4567">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="medicalConditions">Medical Conditions</label>
                    <textarea id="medicalConditions" name="medicalConditions" rows="3" placeholder="List any relevant medical conditions or allergies">${user.medicalConditions || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="preferences">Communication Preferences</label>
                    <div class="checkbox-group">
                        <label class="checkbox-item">
                            <input type="checkbox" name="emailNotifications" ${user.emailNotifications ? 'checked' : ''}>
                            <span>Email Notifications</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" name="smsNotifications" ${user.smsNotifications ? 'checked' : ''}>
                            <span>SMS Notifications</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" name="donationReminders" ${user.donationReminders ? 'checked' : ''}>
                            <span>Donation Reminders</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="window.profileManager.cancelEditing()">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </form>
        `;
    }

    renderSecuritySection() {
        return `
            <div class="security-options">
                <div class="security-item">
                    <div class="security-info">
                        <h4>Change Password</h4>
                        <p>Update your account password for enhanced security</p>
                    </div>
                    <button class="btn btn-outline" onclick="window.profileManager.showChangePasswordModal()">
                        <i class="fas fa-key"></i> Change Password
                    </button>
                </div>
                
                <div class="security-item">
                    <div class="security-info">
                        <h4>Two-Factor Authentication</h4>
                        <p>Add an extra layer of security to your account</p>
                    </div>
                    <button class="btn btn-outline" onclick="window.profileManager.toggleTwoFactor()">
                        <i class="fas fa-shield-alt"></i> Enable 2FA
                    </button>
                </div>
                
                <div class="security-item">
                    <div class="security-info">
                        <h4>Account Verification</h4>
                        <p>Verify your email address and phone number</p>
                    </div>
                    <div class="verification-status">
                        <span class="status-badge ${this.currentUser.isEmailVerified ? 'verified' : 'pending'}">
                            <i class="fas fa-${this.currentUser.isEmailVerified ? 'check' : 'clock'}"></i>
                            Email ${this.currentUser.isEmailVerified ? 'Verified' : 'Pending'}
                        </span>
                        <span class="status-badge ${this.currentUser.isPhoneVerified ? 'verified' : 'pending'}">
                            <i class="fas fa-${this.currentUser.isPhoneVerified ? 'check' : 'clock'}"></i>
                            Phone ${this.currentUser.isPhoneVerified ? 'Verified' : 'Pending'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    renderActivitySummary() {
        return `
            <div class="activity-summary">
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div class="activity-info">
                        <h4>Donations</h4>
                        <p>${this.currentUser.donationCount || 0} total donations</p>
                    </div>
                </div>
                
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <div class="activity-info">
                        <h4>Requests</h4>
                        <p>${this.currentUser.requestCount || 0} blood requests</p>
                    </div>
                </div>
                
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="activity-info">
                        <h4>Last Donation</h4>
                        <p>${this.currentUser.lastDonation ? new Date(this.currentUser.lastDonation).toLocaleDateString() : 'Never'}</p>
                    </div>
                </div>
                
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="activity-info">
                        <h4>Next Eligible</h4>
                        <p>${this.getNextEligibleDate()}</p>
                    </div>
                </div>
            </div>
        `;
    }

    startEditing() {
        this.isEditing = true;
        this.renderProfile();
    }

    cancelEditing() {
        this.isEditing = false;
        this.currentUser = { ...this.originalData };
        this.renderProfile();
    }

    async saveProfile() {
        try {
            const form = document.getElementById('profile-form');
            if (!form) return;

            const formData = new FormData(form);
            const profileData = Object.fromEntries(formData.entries());

            // Add checkbox values
            profileData.emailNotifications = form.querySelector('[name="emailNotifications"]').checked;
            profileData.smsNotifications = form.querySelector('[name="smsNotifications"]').checked;
            profileData.donationReminders = form.querySelector('[name="donationReminders"]').checked;

            // Validate required fields
            if (!profileData.name || !profileData.email) {
                this.showErrorMessage('Name and email are required fields.');
                return;
            }

            // Show loading state
            this.showLoadingState();

            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.auth.getToken()}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = { ...this.currentUser, ...data.data };
                this.originalData = { ...this.currentUser };
                this.isEditing = false;
                this.renderProfile();
                
                // Update auth user
                window.auth.updateUser(this.currentUser);
                
                this.showSuccessMessage('Profile updated successfully!');
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('profileUpdated', {
                    detail: { user: this.currentUser }
                }));
            } else {
                this.showErrorMessage(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            this.showErrorMessage('Failed to update profile. Please try again.');
        } finally {
            this.hideLoadingState();
        }
    }

    autoSaveProfile() {
        // Auto-save functionality for form data
        const form = document.getElementById('profile-form');
        if (!form) return;

        const formData = new FormData(form);
        const profileData = Object.fromEntries(formData.entries());
        
        // Store in localStorage for recovery
        localStorage.setItem('profileAutoSave', JSON.stringify({
            data: profileData,
            timestamp: Date.now()
        }));
    }

    showChangePasswordModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Change Password</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form id="change-password-form" class="auth-form">
                    <div class="form-group">
                        <label for="currentPassword">Current Password</label>
                        <input type="password" id="currentPassword" name="currentPassword" required>
                    </div>
                    <div class="form-group">
                        <label for="newPassword">New Password</label>
                        <input type="password" id="newPassword" name="newPassword" required>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm New Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Change Password</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        modal.querySelector('#change-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.changePassword(modal);
        });
    }

    async changePassword(modal) {
        try {
            const form = modal.querySelector('#change-password-form');
            const formData = new FormData(form);
            const passwordData = Object.fromEntries(formData.entries());

            if (passwordData.newPassword !== passwordData.confirmPassword) {
                this.showErrorMessage('New passwords do not match.');
                return;
            }

            const response = await fetch('/api/users/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.auth.getToken()}`
                },
                body: JSON.stringify(passwordData)
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccessMessage('Password changed successfully!');
                modal.remove();
            } else {
                this.showErrorMessage(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Change password error:', error);
            this.showErrorMessage('Failed to change password. Please try again.');
        }
    }

    toggleTwoFactor() {
        this.showInfoMessage('Two-factor authentication feature coming soon!');
    }

    getNextEligibleDate() {
        if (!this.currentUser.lastDonation) {
            return 'Eligible now';
        }

        const lastDonation = new Date(this.currentUser.lastDonation);
        const nextEligible = new Date(lastDonation);
        nextEligible.setDate(nextEligible.getDate() + 56); // 8 weeks

        const now = new Date();
        if (nextEligible <= now) {
            return 'Eligible now';
        } else {
            return nextEligible.toLocaleDateString();
        }
    }

    capitalizeFirst(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    }

    initializeFormAutoSave() {
        const form = document.getElementById('profile-form');
        if (!form) return;

        // Auto-save every 30 seconds
        const autoSaveInterval = setInterval(() => {
            if (!this.isEditing) {
                clearInterval(autoSaveInterval);
                return;
            }
            this.autoSaveProfile();
        }, 30000);

        // Save on form change
        form.addEventListener('change', () => {
            this.autoSaveProfile();
        });
    }

    showLoadingState() {
        const saveButton = document.querySelector('button[type="submit"]');
        if (saveButton) {
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveButton.disabled = true;
        }
    }

    hideLoadingState() {
        const saveButton = document.querySelector('button[type="submit"]');
        if (saveButton) {
            saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            saveButton.disabled = false;
        }
    }

    showSuccessMessage(message) {
        if (window.notificationManager) {
            window.notificationManager.showSuccessNotification(message);
        } else {
            alert(message);
        }
    }

    showErrorMessage(message) {
        if (window.notificationManager) {
            window.notificationManager.showErrorNotification(message);
        } else {
            alert(message);
        }
    }

    showInfoMessage(message) {
        if (window.notificationManager) {
            window.notificationManager.showSystemNotification(message, 'info');
        } else {
            alert(message);
        }
    }
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});

// Export for use in other modules
window.ProfileManager = ProfileManager; 