const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const Inventory = require('../models/Inventory');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/admin/performance
// @desc    Store performance metrics
// @access  Private (Admin)
router.post('/performance', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { type, data, timestamp } = req.body;
    
    // Store performance metric (in a real app, you'd store this in a database)
    console.log('📊 Performance metric received:', { type, data, timestamp });
    
    res.json({
      success: true,
      message: 'Performance metric stored'
    });
  } catch (error) {
    console.error('Performance metric storage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store performance metric'
    });
  }
});

// @route   GET /api/admin/performance
// @desc    Get performance metrics
// @access  Private (Admin)
router.get('/performance', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    // In a real app, you'd fetch this from a database
    const performanceData = {
      summary: {
        totalApiCalls: 0,
        totalPageLoads: 0,
        slowOperations: 0,
        errors: 0,
        userInteractions: 0
      },
      recent: {
        apiCalls: 0,
        avgApiCallTime: '0.00',
        pageLoads: 0,
        avgPageLoadTime: '0.00'
      },
      slowOperations: [],
      recentErrors: []
    };
    
    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error('Performance metrics retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance metrics'
    });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        // Get all data for dashboard
        const [users, donations, requests, inventory] = await Promise.all([
            User.find({}),
            Donation.find({}),
            Request.find({}),
            Inventory.find({})
        ]);

        // Calculate user statistics
    const userStats = {
            total: users.length,
            donors: users.filter(user => user.role === 'donor').length,
            recipients: users.filter(user => user.role === 'recipient').length,
            admins: users.filter(user => user.role === 'admin').length
        };

        // Calculate donation statistics
    const donationStats = {
            total: donations.length,
            approved: donations.filter(d => d.status === 'approved').length,
            collected: donations.filter(d => d.status === 'collected').length,
            pending: donations.filter(d => d.status === 'pending').length
        };

        // Calculate request statistics
    const requestStats = {
            total: requests.length,
            fulfilled: requests.filter(r => r.status === 'fulfilled').length,
            pending: requests.filter(r => r.status === 'pending').length,
            approved: requests.filter(r => r.status === 'approved').length,
            rejected: requests.filter(r => r.status === 'rejected').length
        };

        // Calculate inventory statistics
    const inventoryStats = {
      totalBloodTypes: inventory.length,
            totalUnits: inventory.reduce((sum, item) => sum + item.availableUnits, 0),
            lowStockItems: inventory.filter(item => item.availableUnits <= (item.minThreshold || 10)).length
        };

        // Calculate recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentActivity = {
            newUsers: users.filter(user => new Date(user.createdAt) >= sevenDaysAgo).length,
            newDonations: donations.filter(donation => new Date(donation.createdAt) >= sevenDaysAgo).length,
            newRequests: requests.filter(request => new Date(request.createdAt) >= sevenDaysAgo).length
        };

        // Calculate blood type distribution for inventory
        const bloodTypeInventory = {};
        inventory.forEach(item => {
            if (!bloodTypeInventory[item.bloodType]) {
                bloodTypeInventory[item.bloodType] = {
                    availableUnits: 0,
                    totalUnits: 0,
                    minThreshold: item.minThreshold || 10
                };
            }
            bloodTypeInventory[item.bloodType].availableUnits += item.availableUnits;
            bloodTypeInventory[item.bloodType].totalUnits += item.totalUnits;
        });

        // Calculate urgency distribution for requests
        const urgencyDistribution = {
            low: requests.filter(r => r.urgency === 'low').length,
            medium: requests.filter(r => r.urgency === 'medium').length,
            high: requests.filter(r => r.urgency === 'high').length,
            critical: requests.filter(r => r.urgency === 'critical').length
        };

    res.json({
      success: true,
      data: {
        statistics: {
          users: userStats,
          donations: donationStats,
          requests: requestStats,
          inventory: inventoryStats
        },
                recentActivity,
                bloodTypeInventory,
                urgencyDistribution,
                lowStockAlerts: inventory.filter(item => 
                    item.availableUnits <= (item.minThreshold || 10)
                ).map(item => ({
                    bloodType: item.bloodType,
                    availableUnits: item.availableUnits,
                    minThreshold: item.minThreshold || 10
                }))
            }
        });
  } catch (error) {
        console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Analytics endpoints
router.get('/analytics/donations', authenticateToken, async (req, res) => {
    try {
        const donations = await Donation.find({}).sort({ createdAt: -1 });
        
        // Calculate monthly trends
        const monthlyTrends = [];
        const currentYear = new Date().getFullYear();
        
        for (let month = 1; month <= 12; month++) {
            const monthDonations = donations.filter(donation => {
                const donationDate = new Date(donation.createdAt);
                return donationDate.getFullYear() === currentYear && 
                       donationDate.getMonth() === month - 1;
            });
            
            monthlyTrends.push({
                year: currentYear,
                month: month,
                count: monthDonations.length
            });
        }

        // Calculate blood type distribution
        const bloodTypeStats = {};
        donations.forEach(donation => {
            const bloodType = donation.bloodType;
            if (!bloodTypeStats[bloodType]) {
                bloodTypeStats[bloodType] = 0;
            }
            bloodTypeStats[bloodType]++;
        });

        res.json({
            success: true,
            data: {
                total: donations.length,
                monthlyTrends: monthlyTrends,
                bloodTypeDistribution: bloodTypeStats,
                recentDonations: donations.slice(0, 10)
            }
        });
    } catch (error) {
        console.error('Analytics donations error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch donation analytics' });
    }
});

router.get('/analytics/requests', authenticateToken, async (req, res) => {
    try {
        const requests = await Request.find({}).sort({ createdAt: -1 });
        
        // Calculate status distribution
        const statusDistribution = {
            pending: 0,
            approved: 0,
            fulfilled: 0,
            rejected: 0
        };
        
        requests.forEach(request => {
            const status = request.status.toLowerCase();
            if (statusDistribution.hasOwnProperty(status)) {
                statusDistribution[status]++;
            }
        });

        // Calculate urgency distribution
        const urgencyDistribution = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
        };
        
        requests.forEach(request => {
            const urgency = request.urgency?.toLowerCase() || 'medium';
            if (urgencyDistribution.hasOwnProperty(urgency)) {
                urgencyDistribution[urgency]++;
            }
        });

    res.json({
      success: true,
      data: {
                total: requests.length,
                statusDistribution: statusDistribution,
                urgencyDistribution: urgencyDistribution,
                recentRequests: requests.slice(0, 10)
            }
        });
  } catch (error) {
        console.error('Analytics requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch request analytics' });
    }
});

router.get('/analytics/inventory', authenticateToken, async (req, res) => {
    try {
        const inventory = await Inventory.find({});
        
        // Calculate inventory trends
        const bloodTypeStats = {};
        inventory.forEach(item => {
            const bloodType = item.bloodType;
            if (!bloodTypeStats[bloodType]) {
                bloodTypeStats[bloodType] = {
                    availableUnits: 0,
                    totalUnits: 0,
                    minThreshold: item.minThreshold || 10
                };
            }
            bloodTypeStats[bloodType].availableUnits += item.availableUnits;
            bloodTypeStats[bloodType].totalUnits += item.totalUnits;
        });

        // Calculate low stock alerts
        const lowStockItems = inventory.filter(item => 
            item.availableUnits <= (item.minThreshold || 10)
        );

        res.json({
            success: true,
            data: {
                totalBloodTypes: inventory.length,
                bloodTypeStats: bloodTypeStats,
                lowStockItems: lowStockItems,
                totalInventory: inventory.reduce((sum, item) => sum + item.availableUnits, 0)
            }
        });
    } catch (error) {
        console.error('Analytics inventory error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch inventory analytics' });
    }
});

router.get('/analytics/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        
        // Calculate user statistics
        const userStats = {
            total: users.length,
            donors: users.filter(user => user.role === 'donor').length,
            recipients: users.filter(user => user.role === 'recipient').length,
            admins: users.filter(user => user.role === 'admin').length
        };

        // Calculate blood type distribution
        const bloodTypeDistribution = {};
        users.forEach(user => {
            if (user.bloodType) {
                if (!bloodTypeDistribution[user.bloodType]) {
                    bloodTypeDistribution[user.bloodType] = {
                        donors: 0,
                        recipients: 0
                    };
                }
                if (user.role === 'donor') {
                    bloodTypeDistribution[user.bloodType].donors++;
                } else if (user.role === 'recipient') {
                    bloodTypeDistribution[user.bloodType].recipients++;
                }
            }
        });

        // Calculate registration trends (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentRegistrations = users.filter(user => 
            new Date(user.createdAt) >= thirtyDaysAgo
        ).length;

    res.json({
      success: true,
      data: {
                ...userStats,
                bloodTypeDistribution: Object.entries(bloodTypeDistribution).map(([bloodType, stats]) => ({
                    bloodType,
                    ...stats
                })),
                recentRegistrations: recentRegistrations,
                activeUsers: users.filter(user => user.lastLogin && 
                    new Date(user.lastLogin) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length
            }
        });
    } catch (error) {
        console.error('Analytics users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user analytics' });
    }
});

// Performance analytics endpoint
router.get('/performance', authenticateToken, async (req, res) => {
    try {
        // Get performance data from the performance monitor
        const performanceData = global.performanceMonitor?.getPerformanceReport() || {};
        
        res.json({
            success: true,
            data: performanceData
        });
  } catch (error) {
        console.error('Performance analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch performance data' });
  }
});

// @route   GET /api/admin/reports/export
// @desc    Export data for reports
// @access  Private (Admin)
router.get('/reports/export', [
  authenticateToken,
  requireAdmin,
  query('type')
    .isIn(['users', 'donations', 'requests', 'inventory'])
    .withMessage('Type must be users, donations, requests, or inventory'),
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be json or csv'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, format = 'json', startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    let data;
    let filename;

    switch (type) {
      case 'users':
        data = await User.find(
          Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}
        ).select('-password');
        filename = 'users_export';
        break;

      case 'donations':
        data = await Donation.find(
          Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}
        ).populate('donor', 'name email phone bloodType');
        filename = 'donations_export';
        break;

      case 'requests':
        data = await Request.find(
          Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}
        ).populate('recipient', 'name email phone bloodType');
        filename = 'requests_export';
        break;

      case 'inventory':
        data = await Inventory.find({});
        filename = 'inventory_export';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    if (format === 'csv') {
      // For CSV format, you would typically use a library like 'csv-writer'
      // For now, we'll return JSON with a note about CSV implementation
      res.json({
        success: true,
        message: 'CSV export would be implemented with a CSV library',
        data: data,
        note: 'In production, implement CSV conversion using libraries like csv-writer or json2csv'
      });
    } else {
      res.json({
        success: true,
        data: data,
        exportInfo: {
          type,
          format,
          recordCount: data.length,
          exportedAt: new Date(),
          dateRange: Object.keys(dateFilter).length ? { startDate, endDate } : 'all'
        }
      });
    }

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during data export',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
