// Contact Form Handler for Blood Bank Management System

class ContactFormHandler {
    constructor() {
        this.form = null;
        this.initialize();
    }

    initialize() {
        console.log('📞 Initializing Contact Form Handler...');
        this.setupContactForm();
        this.setupEventListeners();
    }

    setupContactForm() {
        this.form = document.getElementById('contactForm');
        if (!this.form) return;

        // Add form validation and submission handling
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactSubmission();
        });

        // Add real-time validation
        this.setupFormValidation();
    }

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        this.clearFieldError(field);

        // Validation rules
        switch (fieldName) {
            case 'name':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Name is required';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters';
                }
                break;

            case 'email':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Email is required';
                } else if (!this.isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;

            case 'phone':
                if (value && !this.isValidPhone(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;

            case 'subject':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Please select a subject';
                }
                break;

            case 'message':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Message is required';
                } else if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Message must be at least 10 characters';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    showFieldError(field, message) {
        field.style.borderColor = '#ef4444';
        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        
        // Create or update error message
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.color = '#ef4444';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
    }

    clearFieldError(field) {
        field.style.borderColor = '#e5e7eb';
        field.style.boxShadow = '';
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async handleContactSubmission() {
        if (!this.form) return;

        // Validate all fields
        const fields = this.form.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showErrorMessage('Please correct the errors in the form.');
            return;
        }

        // Get form data
        const formData = new FormData(this.form);
        const contactData = Object.fromEntries(formData.entries());
        
        // Add urgent flag
        contactData.urgent = this.form.querySelector('#contactUrgent').checked;

        // Show loading state
        this.showLoadingState();

        try {
            // Simulate API call (in real implementation, this would send to server)
            await this.simulateContactSubmission(contactData);
            
            // Show success message
            this.showSuccessMessage('Thank you for your message! We will get back to you soon.');
            
            // Reset form
            this.form.reset();
            
            // Clear any error styling
            fields.forEach(field => this.clearFieldError(field));
            
        } catch (error) {
            console.error('Contact submission error:', error);
            this.showErrorMessage('Failed to send message. Please try again.');
        } finally {
            this.hideLoadingState();
        }
    }

    async simulateContactSubmission(data) {
        try {
            const response = await fetch('/api/contact/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit contact form');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Contact form submission error:', error);
            throw error;
        }
    }

    showLoadingState() {
        const submitButton = this.form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitButton.disabled = true;
        }
    }

    hideLoadingState() {
        const submitButton = this.form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            submitButton.disabled = false;
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

    setupEventListeners() {
        // Listen for emergency contact clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.emergency-phone')) {
                this.handleEmergencyCall();
            }
        });

        // Listen for contact card clicks
        document.addEventListener('click', (e) => {
            const contactCard = e.target.closest('.contact-card');
            if (contactCard) {
                this.handleContactCardClick(contactCard);
            }
        });
    }

    handleEmergencyCall() {
        const phoneNumber = '+1 (555) 911-0000';
        
        // Show confirmation dialog
        if (confirm(`Call emergency hotline: ${phoneNumber}?`)) {
            // In a real implementation, this would initiate a phone call
            console.log('Initiating emergency call to:', phoneNumber);
            
            // Show notification
            if (window.notificationManager) {
                window.notificationManager.showInfoMessage('Emergency call initiated. Please use your phone to complete the call.');
            }
        }
    }

    handleContactCardClick(card) {
        // Add click animation
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Get contact information
        const details = card.querySelector('.contact-details');
        const title = details.querySelector('h4').textContent;
        
        // Show contact information in a more detailed way
        console.log('Contact card clicked:', title);
    }

    // Utility method to copy contact information
    copyContactInfo(type, value) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(value).then(() => {
                if (window.notificationManager) {
                    window.notificationManager.showSuccessNotification(`${type} copied to clipboard!`);
                }
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        }
    }

    // Method to handle urgent contact submissions
    handleUrgentSubmission(data) {
        // For urgent matters, show immediate notification
        if (window.notificationManager) {
            window.notificationManager.showWarningNotification('Urgent message received. We will respond immediately.');
        }
        
        // In a real implementation, this would trigger immediate alerts
        console.log('Urgent contact submission:', data);
    }

    destroy() {
        if (this.form) {
            this.form.removeEventListener('submit', this.handleContactSubmission);
        }
    }
}

// Initialize contact form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.contactFormHandler = new ContactFormHandler();
});

// Export for use in other modules
window.ContactFormHandler = ContactFormHandler; 