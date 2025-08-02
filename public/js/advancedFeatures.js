// Advanced Features for Blood Bank Management System

class AdvancedFeatures {
  constructor() {
    this.offlineQueue = [];
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
    this.initializeServiceWorker();
  }

  setupEventListeners() {
    // Online/Offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });

    // Page visibility API for performance
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlePageHidden();
      } else {
        this.handlePageVisible();
      }
    });
  }

  async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration);
      } catch (error) {
        console.log('❌ Service Worker registration failed:', error);
      }
    }
  }

  handleOnline() {
    console.log('🌐 Back online - processing queued requests');
    this.processOfflineQueue();
    this.showNotification('Connection restored', 'success');
  }

  handleOffline() {
    console.log('📴 Going offline - requests will be queued');
    this.showNotification('You are offline. Changes will be saved when connection is restored.', 'warning');
  }

  handlePageHidden() {
    // Pause non-critical operations when page is hidden
    console.log('📱 Page hidden - pausing non-critical operations');
  }

  handlePageVisible() {
    // Resume operations when page becomes visible
    console.log('📱 Page visible - resuming operations');
    // Resume real-time updates if they were stopped
    this.startRealTimeUpdates();
  }

  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    console.log(`🔄 Processing ${this.offlineQueue.length} queued requests`);
    
    for (const request of this.offlineQueue) {
      try {
        await this.executeQueuedRequest(request);
      } catch (error) {
        console.error('Failed to process queued request:', error);
      }
    }

    this.offlineQueue = [];
    this.showNotification('All offline changes have been synchronized', 'success');
  }

  async executeQueuedRequest(request) {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }

  queueRequest(request) {
    this.offlineQueue.push(request);
    localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
    console.log('📦 Request queued for offline processing');
  }

  // Real-time updates using polling
  startRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.checkForUpdates();
    }, 30000); // Check every 30 seconds
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async checkForUpdates() {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      
      if (data.success) {
        this.updateInventoryDisplay(data.data.inventory);
      }
    } catch (error) {
      console.log('Real-time update failed:', error);
    }
  }

  updateInventoryDisplay(inventory) {
    // Update inventory display without full page reload
    const inventoryGrid = document.querySelector('.inventory-grid');
    if (inventoryGrid) {
      inventory.forEach(item => {
        const itemElement = inventoryGrid.querySelector(`[data-blood-type="${item.bloodType}"]`);
        if (itemElement) {
          const unitsElement = itemElement.querySelector('.units');
          if (unitsElement) {
            unitsElement.textContent = `${item.availableUnits} units`;
          }
        }
      });
    }
  }

  // Enhanced notifications
  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Add to notification container
    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
    }

    container.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  }

  // Performance monitoring
  measurePerformance(operation, callback) {
    const start = performance.now();
    const result = callback();
    const duration = performance.now() - start;
    
    console.log(`⏱️ ${operation} took ${duration.toFixed(2)}ms`);
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`🐌 Slow operation detected: ${operation} (${duration.toFixed(2)}ms)`);
    }

    return result;
  }

  // Data caching
  cacheData(key, data, ttl = 300000) { // 5 minutes default
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
  }

  getCachedData(key) {
    const cached = localStorage.getItem(`cache_${key}`);
    if (!cached) return null;

    const cacheEntry = JSON.parse(cached);
    const now = Date.now();
    
    if (now - cacheEntry.timestamp > cacheEntry.ttl) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }

    return cacheEntry.data;
  }

  // Form auto-save
  setupFormAutoSave(formId, saveInterval = 30000) {
    const form = document.getElementById(formId);
    if (!form) return;

    let autoSaveTimer;
    const originalData = this.getFormData(form);

    form.addEventListener('input', () => {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        this.autoSaveForm(form);
      }, saveInterval);
    });

    // Restore form data on page load
    this.restoreFormData(form);
  }

  getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    return data;
  }

  autoSaveForm(form) {
    const formData = this.getFormData(form);
    const formId = form.id;
    
    localStorage.setItem(`autosave_${formId}`, JSON.stringify({
      data: formData,
      timestamp: Date.now()
    }));

    console.log(`💾 Auto-saved form: ${formId}`);
  }

  restoreFormData(form) {
    const formId = form.id;
    const saved = localStorage.getItem(`autosave_${formId}`);
    
    if (saved) {
      const { data, timestamp } = JSON.parse(saved);
      const now = Date.now();
      
      // Only restore if saved within last hour
      if (now - timestamp < 3600000) {
        Object.keys(data).forEach(key => {
          const element = form.querySelector(`[name="${key}"]`);
          if (element) {
            element.value = data[key];
          }
        });
        console.log(`📋 Restored form data: ${formId}`);
      } else {
        localStorage.removeItem(`autosave_${formId}`);
      }
    }
  }

  // Keyboard shortcuts
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveCurrentForm();
      }

      // Ctrl/Cmd + N: New donation/request
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.createNewItem();
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  saveCurrentForm() {
    const activeForm = document.querySelector('form:focus-within');
    if (activeForm) {
      activeForm.dispatchEvent(new Event('submit'));
    }
  }

  createNewItem() {
    const user = window.auth?.getCurrentUser();
    if (user?.role === 'donor') {
      window.dashboard?.switchTab('new-donation');
    } else if (user?.role === 'recipient') {
      window.dashboard?.switchTab('new-request');
    }
  }

  closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (modal.classList.contains('show')) {
        modal.classList.remove('show');
      }
    });
  }

  // Accessibility enhancements
  enhanceAccessibility() {
    // Add ARIA labels
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
      if (!button.textContent.trim()) {
        button.setAttribute('aria-label', button.title || 'Button');
      }
    });

    // Add focus indicators
    const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
    focusableElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.style.outline = '2px solid #3b82f6';
      });
      
      element.addEventListener('blur', () => {
        element.style.outline = '';
      });
    });
  }

  // Initialize all advanced features
  initialize() {
    console.log('🚀 Initializing advanced features...');
    
    this.setupKeyboardShortcuts();
    this.enhanceAccessibility();
    this.startRealTimeUpdates();
    
    // Setup form auto-save for main forms
    this.setupFormAutoSave('newDonationForm');
    this.setupFormAutoSave('newRequestForm');
    
    console.log('✅ Advanced features initialized');
  }
}

// Initialize advanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.advancedFeatures = new AdvancedFeatures();
  window.advancedFeatures.initialize();
});

// Export for use in other modules
window.AdvancedFeatures = AdvancedFeatures; 