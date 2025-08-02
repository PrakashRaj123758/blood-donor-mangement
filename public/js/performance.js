// Performance Monitoring and Analytics
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            apiResponseTimes: {},
            memoryUsage: 0,
            errorCount: 0,
            userInteractions: []
        };
        this.startTime = performance.now();
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.setupPerformanceObserver();
        this.setupErrorTracking();
        this.setupUserInteractionTracking();
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            this.metrics.pageLoadTime = performance.now() - this.startTime;
            console.log('📊 Page load time:', this.metrics.pageLoadTime.toFixed(2), 'ms');
        });
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure') {
                        console.log('📊 Performance measure:', entry.name, entry.duration.toFixed(2), 'ms');
                    }
                }
            });
            observer.observe({ entryTypes: ['measure'] });
        }
    }

    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.metrics.errorCount++;
            console.error('❌ Error tracked:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.metrics.errorCount++;
            console.error('❌ Unhandled promise rejection:', event.reason);
        });
    }

    setupUserInteractionTracking() {
        const trackInteraction = (event) => {
            this.metrics.userInteractions.push({
                type: event.type,
                target: event.target.tagName,
                timestamp: Date.now()
            });
        };

        ['click', 'input', 'submit'].forEach(eventType => {
            document.addEventListener(eventType, trackInteraction);
        });
    }

    measureApiCall(endpoint, startTime) {
        const duration = performance.now() - startTime;
        this.metrics.apiResponseTimes[endpoint] = duration;
        console.log('📊 API call duration:', endpoint, duration.toFixed(2), 'ms');
        return duration;
    }

    getMetrics() {
        return {
            ...this.metrics,
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
            timestamp: Date.now()
        };
    }

    getPerformanceReport() {
        const metrics = this.getMetrics();
        return {
            summary: {
                pageLoadTime: metrics.pageLoadTime,
                averageApiResponseTime: this.calculateAverageApiResponseTime(),
                errorRate: this.calculateErrorRate(),
                memoryUsage: metrics.memoryUsage
            },
            details: metrics
        };
    }

    calculateAverageApiResponseTime() {
        const times = Object.values(this.metrics.apiResponseTimes);
        return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    }

    calculateErrorRate() {
        return this.metrics.errorCount > 0 ? (this.metrics.errorCount / 100) * 100 : 0;
    }

    exportMetrics() {
        const data = this.getMetrics();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-metrics-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize performance monitor
window.performanceMonitor = new PerformanceMonitor();

// Export function for global access
window.exportPerformanceMetrics = function() {
    window.performanceMonitor.exportMetrics();
}; 