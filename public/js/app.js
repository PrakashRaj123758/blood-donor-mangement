// Main application file for Blood Bank Management System

class BloodBankApp {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }

    onDOMReady() {
        this.setupNavigation();
        this.loadPublicData();
        this.setupEventListeners();
    }

    setupNavigation() {
        // Mobile navigation toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }

                // Close mobile menu
                if (navMenu) {
                    navMenu.classList.remove('active');
                }
            });
        });

        // Update active nav link on scroll
        this.setupScrollSpy();
    }

    setupScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (window.pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    async loadPublicData() {
        try {
            // Load blood inventory for public display
            await this.loadBloodInventory();
            
            // Load statistics for hero section
            await this.loadHeroStatistics();
        } catch (error) {
            console.error('Error loading public data:', error);
        }
    }

    async loadBloodInventory() {
        try {
            const response = await api.getInventory();
            const inventory = response.data.inventory;

            const bloodGrid = document.getElementById('bloodGrid');
            if (!bloodGrid) return;

            bloodGrid.innerHTML = inventory.map(item => `
                <div class="blood-card">
                    <div class="blood-type">${item.bloodType}</div>
                    <div class="blood-units">${item.availableUnits} units</div>
                    <div class="blood-status ${this.getStockStatusClass(item.stockStatus)}">
                        ${Utils.capitalize(item.stockStatus)} Stock
                    </div>
                    <div class="blood-percentage">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${item.stockPercentage}%"></div>
                        </div>
                        <span>${item.stockPercentage}%</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading blood inventory:', error);
            const bloodGrid = document.getElementById('bloodGrid');
            if (bloodGrid) {
                bloodGrid.innerHTML = '<p class="error-message">Unable to load blood inventory at this time.</p>';
            }
        }
    }

    getStockStatusClass(status) {
        const statusMap = {
            'high': 'status-high',
            'normal': 'status-normal',
            'low': 'status-low',
            'critical': 'status-critical'
        };
        return statusMap[status] || 'status-normal';
    }

    async loadHeroStatistics() {
        try {
            // Mock statistics for demo - in production, these would come from API
            const stats = {
                totalDonors: 1250,
                totalDonations: 3480,
                totalRequests: 2890
            };

            // Animate counters
            this.animateCounter('totalDonors', stats.totalDonors);
            this.animateCounter('totalDonations', stats.totalDonations);
            this.animateCounter('totalRequests', stats.totalRequests);
        } catch (error) {
            console.error('Error loading hero statistics:', error);
        }
    }

    animateCounter(elementId, target) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 20);
    }

    setupEventListeners() {
        // Contact form (if exists)
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Newsletter signup (if exists)
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSignup(e));
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Window resize handler
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));

        // Online/offline status
        window.addEventListener('online', () => {
            toast.success('Connection restored');
            this.loadPublicData(); // Refresh data when back online
        });

        window.addEventListener('offline', () => {
            toast.warning('You are currently offline');
        });
    }

    handleContactForm(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Validate form data
        if (!data.name || !data.email || !data.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!Utils.isValidEmail(data.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        // In a real application, you would send this to your backend
        toast.success('Thank you for your message! We will get back to you soon.');
        e.target.reset();
    }

    handleNewsletterSignup(e) {
        e.preventDefault();
        
        const email = e.target.querySelector('input[type="email"]').value;
        
        if (!Utils.isValidEmail(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        // In a real application, you would send this to your backend
        toast.success('Thank you for subscribing to our newsletter!');
        e.target.reset();
    }

    handleSearch(query) {
        if (!query || query.length < 2) return;

        // Implement search functionality
        console.log('Searching for:', query);
        
        // In a real application, you would search through:
        // - Blood types
        // - Locations
        // - FAQs
        // - Help articles
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    handleResize() {
        // Handle responsive layout changes
        const navMenu = document.getElementById('nav-menu');
        if (window.innerWidth > 768 && navMenu) {
            navMenu.classList.remove('active');
        }
    }

    // Utility methods for dashboard components
    createFormField(type, name, label, options = {}) {
        const required = options.required ? 'required' : '';
        const value = options.value || '';
        const placeholder = options.placeholder || '';
        
        let input = '';
        
        switch (type) {
            case 'select':
                input = `
                    <select id="${name}" name="${name}" ${required}>
                        <option value="">Select ${label}</option>
                        ${options.options.map(opt => 
                            `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
                        ).join('')}
                    </select>
                `;
                break;
            case 'textarea':
                input = `<textarea id="${name}" name="${name}" placeholder="${placeholder}" ${required}>${value}</textarea>`;
                break;
            default:
                input = `<input type="${type}" id="${name}" name="${name}" value="${value}" placeholder="${placeholder}" ${required}>`;
        }

        return `
            <div class="form-group">
                <label for="${name}">${label} ${options.required ? '<span class="required">*</span>' : ''}</label>
                ${input}
            </div>
        `;
    }

    createDataTable(data, columns, options = {}) {
        if (!data || data.length === 0) {
            return '<div class="no-data">No data available</div>';
        }

        const headers = columns.map(col => `<th>${col.label}</th>`).join('');
        const rows = data.map(item => {
            const cells = columns.map(col => {
                let value = item[col.key];
                
                if (col.format) {
                    value = col.format(value, item);
                }
                
                return `<td>${value}</td>`;
            }).join('');
            
            return `<tr onclick="${options.onRowClick ? `${options.onRowClick}('${item.id || item._id}')` : ''}">${cells}</tr>`;
        }).join('');

        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>${headers}</tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    createPagination(currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) return '';

        const prevDisabled = currentPage <= 1 ? 'disabled' : '';
        const nextDisabled = currentPage >= totalPages ? 'disabled' : '';

        let pages = '';
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const active = i === currentPage ? 'active' : '';
            pages += `<button class="pagination-btn ${active}" onclick="${onPageChange}(${i})">${i}</button>`;
        }

        return `
            <div class="pagination">
                <button class="pagination-btn ${prevDisabled}" onclick="${onPageChange}(${currentPage - 1})" ${prevDisabled}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                ${pages}
                <button class="pagination-btn ${nextDisabled}" onclick="${onPageChange}(${currentPage + 1})" ${nextDisabled}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }
}

// Initialize the application
window.app = new BloodBankApp();

// Global utility functions for dashboard
window.formatStatus = (status) => {
    return `<span class="status ${Utils.getStatusClass(status)}">${Utils.capitalize(status)}</span>`;
};

window.formatDate = (date) => {
    return Utils.formatDate(date);
};

window.formatDateTime = (date) => {
    return Utils.formatDateTime(date);
};

window.formatBloodType = (bloodType) => {
    return `<span class="blood-type-badge">${bloodType}</span>`;
};

window.formatUrgency = (urgency) => {
    return `<span class="urgency ${Utils.getUrgencyClass(urgency)}">${Utils.capitalize(urgency)}</span>`;
};
