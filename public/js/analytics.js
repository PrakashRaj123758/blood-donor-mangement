// Advanced Analytics for Blood Bank Management System

class AnalyticsManager {
  constructor() {
    this.charts = {};
    this.data = {};
    this.updateInterval = null;
    // Removed automatic initialization to prevent errors
  }

  async initialize() {
    console.log('📊 Initializing Analytics Manager...');
    await this.loadAnalyticsData();
    this.setupRealTimeUpdates();
    this.createDashboardCharts();
  }

  async loadAnalyticsData() {
    try {
      const [inventoryData, donationData, requestData, userData] = await Promise.all([
        this.fetchInventoryAnalytics(),
        this.fetchDonationAnalytics(),
        this.fetchRequestAnalytics(),
        this.fetchUserAnalytics()
      ]);

      this.data = {
        inventory: inventoryData,
        donations: donationData,
        requests: requestData,
        users: userData
      };

      console.log('✅ Analytics data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load analytics data:', error);
    }
  }

  async fetchInventoryAnalytics() {
    try {
      const response = await api.getInventory();
      return response.success ? response.data.inventory : [];
    } catch (error) {
      console.error('Failed to fetch inventory analytics:', error);
      return [];
    }
  }

  async fetchDonationAnalytics() {
    try {
      const response = await api.getDonationAnalytics();
      return response.success ? response.data : {};
    } catch (error) {
      console.error('Failed to fetch donation analytics:', error);
      return {};
    }
  }

  async fetchRequestAnalytics() {
    try {
      const response = await api.getRequestAnalytics();
      return response.success ? response.data : {};
    } catch (error) {
      console.error('Failed to fetch request analytics:', error);
      return {};
    }
  }

  async fetchUserAnalytics() {
    try {
      const response = await api.getUserStatistics();
      return response.success ? response.data : {};
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
      return {};
    }
  }

  setupRealTimeUpdates() {
    // Update analytics every 5 minutes
    this.updateInterval = setInterval(async () => {
      await this.loadAnalyticsData();
      this.updateCharts();
    }, 5 * 60 * 1000);
  }

  createDashboardCharts() {
    this.createInventoryChart();
    this.createDonationTrendChart();
    this.createRequestStatusChart();
    this.createUserActivityChart();
    this.createBloodTypeDistributionChart();
  }

  createInventoryChart() {
    const ctx = document.getElementById('inventoryChart');
    if (!ctx || !window.Chart) return;

    const inventoryData = this.data.inventory || [];
    const labels = inventoryData.map(item => item.bloodType);
    const availableData = inventoryData.map(item => item.availableUnits);
    const thresholdData = inventoryData.map(item => item.minThreshold || 10);

    this.charts.inventory = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Available Units',
            data: availableData,
            backgroundColor: '#10b981',
            borderColor: '#059669',
            borderWidth: 1
          },
          {
            label: 'Minimum Threshold',
            data: thresholdData,
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            borderWidth: 1,
            type: 'line'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Blood Inventory Status'
          },
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Units'
            }
          }
        }
      }
    });
  }

  createDonationTrendChart() {
    const ctx = document.getElementById('donationTrendChart');
    if (!ctx || !window.Chart) return;

    const donationData = this.data.donations || {};
    const monthlyData = donationData.monthlyTrends || [];
    
    const labels = monthlyData.map(item => `${item.year}-${item.month}`);
    const data = monthlyData.map(item => item.count);

    this.charts.donationTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Monthly Donations',
          data: data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Donation Trends'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Donations'
            }
          }
        }
      }
    });
  }

  createRequestStatusChart() {
    const ctx = document.getElementById('requestStatusChart');
    if (!ctx || !window.Chart) return;

    const requestData = this.data.requests || {};
    const statusData = requestData.statusDistribution || {
      pending: 15,
      approved: 25,
      fulfilled: 45,
      rejected: 5
    };

    this.charts.requestStatus = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Approved', 'Fulfilled', 'Rejected'],
        datasets: [{
          data: [
            statusData.pending || 0,
            statusData.approved || 0,
            statusData.fulfilled || 0,
            statusData.rejected || 0
          ],
          backgroundColor: [
            '#f59e0b',
            '#3b82f6',
            '#10b981',
            '#ef4444'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Request Status Distribution'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  createUserActivityChart() {
    const ctx = document.getElementById('userActivityChart');
    if (!ctx || !window.Chart) return;

    const userData = this.data.users || {};
    const activityData = userData.activityTrends || [];

    const labels = activityData.map(item => item.date);
    const data = activityData.map(item => item.activeUsers);

    this.charts.userActivity = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Active Users',
          data: data,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'User Activity Trends'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Active Users'
            }
          }
        }
      }
    });
  }

  createBloodTypeDistributionChart() {
    const ctx = document.getElementById('bloodTypeDistributionChart');
    if (!ctx || !window.Chart) return;

    const userData = this.data.users || {};
    const distribution = userData.bloodTypeDistribution || [];

    const labels = distribution.map(item => item.bloodType);
    const donorData = distribution.map(item => item.donors);
    const recipientData = distribution.map(item => item.recipients);

    this.charts.bloodTypeDistribution = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Donors',
            data: donorData,
            backgroundColor: '#10b981'
          },
          {
            label: 'Recipients',
            data: recipientData,
            backgroundColor: '#ef4444'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Blood Type Distribution'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Users'
            }
          }
        }
      }
    });
  }



  updateCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.update === 'function') {
        chart.update('none'); // Update without animation for better performance
      }
    });
  }

  generateReport(type = 'comprehensive') {
    const report = {
      timestamp: new Date().toISOString(),
      type: type,
      summary: {
        totalInventory: this.data.inventory?.length || 0,
        totalDonations: this.data.donations?.total || 0,
        totalRequests: this.data.requests?.total || 0,
        totalUsers: this.data.users?.total || 0
      },
      details: this.data
    };

    return report;
  }

  exportReport(format = 'json') {
    const report = this.generateReport();
    
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'csv':
        return this.convertToCSV(report);
      case 'pdf':
        return this.generatePDF(report);
      default:
        return JSON.stringify(report, null, 2);
    }
  }

  convertToCSV(data) {
    // Simple CSV conversion
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Inventory', data.summary.totalInventory],
      ['Total Donations', data.summary.totalDonations],
      ['Total Requests', data.summary.totalRequests],
      ['Total Users', data.summary.totalUsers]
    ];

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  generatePDF(data) {
    // This would typically use a PDF library like jsPDF
    // For now, return a simple HTML representation
    return `
      <html>
        <head><title>Blood Bank Analytics Report</title></head>
        <body>
          <h1>Blood Bank Analytics Report</h1>
          <p>Generated: ${data.timestamp}</p>
          <h2>Summary</h2>
          <ul>
            <li>Total Inventory: ${data.summary.totalInventory}</li>
            <li>Total Donations: ${data.summary.totalDonations}</li>
            <li>Total Requests: ${data.summary.totalRequests}</li>
            <li>Total Users: ${data.summary.totalUsers}</li>
          </ul>
        </body>
      </html>
    `;
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    
    this.charts = {};
  }
}

 