// Performance Monitoring for Blood Bank Management System

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoads: 0,
      apiCalls: 0,
      slowOperations: [],
      errors: [],
      userInteractions: []
    };
    
    this.startTime = performance.now();
    this.setupMonitoring();
  }

  setupMonitoring() {
    // Monitor page load performance
    this.monitorPageLoad();
    
    // Monitor API calls
    this.monitorApiCalls();
    
    // Monitor user interactions
    this.monitorUserInteractions();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor network performance
    this.monitorNetworkPerformance();
  }

  monitorPageLoad() {
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.startTime;
      this.metrics.pageLoads++;
      
      this.logMetric('page_load', {
        loadTime: loadTime,
        timestamp: Date.now()
      });
      
      if (loadTime > 3000) {
        this.logSlowOperation('Page load', loadTime);
      }
    });
  }

  monitorApiCalls() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      this.metrics.apiCalls++;
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        this.logMetric('api_call', {
          url: args[0],
          method: args[1]?.method || 'GET',
          duration: duration,
          status: response.status,
          timestamp: Date.now()
        });
        
        if (duration > 2000) {
          this.logSlowOperation('API call', duration, args[0]);
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.logError('API call failed', error, {
          url: args[0],
          duration: duration
        });
        throw error;
      }
    };
  }

  monitorUserInteractions() {
    const events = ['click', 'input', 'submit', 'scroll'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.metrics.userInteractions.push({
          type: eventType,
          target: event.target.tagName,
          timestamp: Date.now()
        });
        
        // Keep only last 100 interactions
        if (this.metrics.userInteractions.length > 100) {
          this.metrics.userInteractions = this.metrics.userInteractions.slice(-100);
        }
      });
    });
  }

  monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.logMetric('memory_usage', {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: Date.now()
        });
        
        // Alert if memory usage is high
        const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercentage > 80) {
          this.logError('High memory usage', null, {
            usagePercentage: usagePercentage,
            usedJSHeapSize: memory.usedJSHeapSize
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  monitorNetworkPerformance() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      this.logMetric('network_info', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        timestamp: Date.now()
      });
      
      connection.addEventListener('change', () => {
        this.logMetric('network_change', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          timestamp: Date.now()
        });
      });
    }
  }

  logMetric(type, data) {
    const metric = {
      type: type,
      data: data,
      timestamp: Date.now()
    };
    
    // Store in localStorage for persistence
    const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
    metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }
    
    localStorage.setItem('performance_metrics', JSON.stringify(metrics));
    
    // Send to server if online
    this.sendMetricToServer(metric);
  }

  logSlowOperation(operation, duration, details = null) {
    const slowOp = {
      operation: operation,
      duration: duration,
      details: details,
      timestamp: Date.now()
    };
    
    this.metrics.slowOperations.push(slowOp);
    
    // Keep only last 50 slow operations
    if (this.metrics.slowOperations.length > 50) {
      this.metrics.slowOperations = this.metrics.slowOperations.slice(-50);
    }
    
    console.warn(`🐌 Slow operation detected: ${operation} (${duration.toFixed(2)}ms)`, details);
  }

  logError(message, error, context = {}) {
    const errorLog = {
      message: message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null,
      context: context,
      timestamp: Date.now()
    };
    
    this.metrics.errors.push(errorLog);
    
    // Keep only last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }
    
    console.error('❌ Performance error:', message, error, context);
  }

  async sendMetricToServer(metric) {
    try {
      await fetch('/api/admin/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(metric)
      });
    } catch (error) {
      // Silently fail - metrics are stored locally anyway
    }
  }

  getPerformanceReport() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
    
    const recentMetrics = metrics.filter(m => m.timestamp > oneHourAgo);
    const dailyMetrics = metrics.filter(m => m.timestamp > oneDayAgo);
    
    const apiCalls = recentMetrics.filter(m => m.type === 'api_call');
    const pageLoads = recentMetrics.filter(m => m.type === 'page_load');
    
    const avgApiCallTime = apiCalls.length > 0 
      ? apiCalls.reduce((sum, m) => sum + m.data.duration, 0) / apiCalls.length 
      : 0;
    
    const avgPageLoadTime = pageLoads.length > 0 
      ? pageLoads.reduce((sum, m) => sum + m.data.loadTime, 0) / pageLoads.length 
      : 0;
    
    return {
      summary: {
        totalApiCalls: this.metrics.apiCalls,
        totalPageLoads: this.metrics.pageLoads,
        slowOperations: this.metrics.slowOperations.length,
        errors: this.metrics.errors.length,
        userInteractions: this.metrics.userInteractions.length
      },
      recent: {
        apiCalls: apiCalls.length,
        avgApiCallTime: avgApiCallTime.toFixed(2),
        pageLoads: pageLoads.length,
        avgPageLoadTime: avgPageLoadTime.toFixed(2)
      },
      slowOperations: this.metrics.slowOperations.slice(-10),
      recentErrors: this.metrics.errors.slice(-10)
    };
  }

  // Performance optimization helpers
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Memory management
  cleanup() {
    // Clear old metrics
    const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentMetrics = metrics.filter(m => m.timestamp > oneWeekAgo);
    localStorage.setItem('performance_metrics', JSON.stringify(recentMetrics));
    
    // Clear old errors and slow operations
    this.metrics.errors = this.metrics.errors.slice(-50);
    this.metrics.slowOperations = this.metrics.slowOperations.slice(-25);
    this.metrics.userInteractions = this.metrics.userInteractions.slice(-50);
  }
}

// Initialize performance monitor
window.performanceMonitor = new PerformanceMonitor();

// Cleanup every hour
setInterval(() => {
  window.performanceMonitor.cleanup();
}, 60 * 60 * 1000);

console.log('📊 Performance monitoring initialized'); 