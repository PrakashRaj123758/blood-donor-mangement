const express = require('express');
const { query, validationResult } = require('express-validator');
const Inventory = require('../models/Inventory');
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/inventory
// @desc    Get blood inventory (public for availability check)
// @access  Public/Private
router.get('/', [
  optionalAuth,
  query('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
  query('location')
    .optional()
    .isString()
    .trim()
    .withMessage('Location must be a string')
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

    const { bloodType, location } = req.query;

    // Build query
    let query = {};
    if (bloodType) query.bloodType = bloodType;

    const inventory = await Inventory.find(query).sort({ bloodType: 1 });

    // Update expired units for all blood types
    await Promise.all(inventory.map(inv => inv.updateExpiredUnits()));

    // Generate alerts for admins
    if (req.user && req.user.role === 'admin') {
      await Promise.all(inventory.map(inv => inv.generateAlerts()));
    }

    // Filter sensitive information for non-admin users
    const publicInventory = inventory.map(inv => {
      const publicData = {
        bloodType: inv.bloodType,
        availableUnits: inv.availableUnits,
        stockStatus: inv.getStockStatus(),
        stockPercentage: inv.getStockPercentage(),
        lastUpdated: inv.lastUpdated
      };

      // Include additional details for authenticated users
      if (req.user) {
        publicData.totalUnits = inv.totalUnits;
        publicData.reservedUnits = inv.reservedUnits;
        
        // Include alerts and detailed stats for admins
        if (req.user.role === 'admin') {
          publicData.expiredUnits = inv.expiredUnits;
          publicData.minThreshold = inv.minThreshold;
          publicData.maxCapacity = inv.maxCapacity;
          publicData.statistics = inv.statistics;
          publicData.alerts = inv.alerts.filter(alert => alert.isActive);
        }
      }

      return publicData;
    });

    res.json({
      success: true,
      data: { inventory: publicInventory }
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/inventory/:bloodType
// @desc    Get specific blood type inventory
// @access  Public/Private
router.get('/:bloodType', [
  optionalAuth,
  query('includeDetails')
    .optional()
    .isBoolean()
    .withMessage('includeDetails must be a boolean')
], async (req, res) => {
  try {
    const { bloodType } = req.params;
    const { includeDetails = false } = req.query;

    // Validate blood type
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodTypes.includes(bloodType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blood type'
      });
    }

    const inventory = await Inventory.findOne({ bloodType });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Blood type not found in inventory'
      });
    }

    // Update expired units
    await inventory.updateExpiredUnits();

    // Generate alerts for admins
    if (req.user && req.user.role === 'admin') {
      await inventory.generateAlerts();
    }

    // Prepare response data
    const responseData = {
      bloodType: inventory.bloodType,
      availableUnits: inventory.availableUnits,
      stockStatus: inventory.getStockStatus(),
      stockPercentage: inventory.getStockPercentage(),
      lastUpdated: inventory.lastUpdated
    };

    // Include additional details for authenticated users
    if (req.user) {
      responseData.totalUnits = inventory.totalUnits;
      responseData.reservedUnits = inventory.reservedUnits;

      // Include detailed information if requested and user is admin
      if (includeDetails && req.user.role === 'admin') {
        responseData.expiredUnits = inventory.expiredUnits;
        responseData.minThreshold = inventory.minThreshold;
        responseData.maxCapacity = inventory.maxCapacity;
        responseData.statistics = inventory.statistics;
        responseData.alerts = inventory.alerts.filter(alert => alert.isActive);
        responseData.donations = inventory.donations;
        responseData.requests = inventory.requests;
      }
    }

    res.json({
      success: true,
      data: { inventory: responseData }
    });

  } catch (error) {
    console.error('Get blood type inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching blood type inventory',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/inventory/:bloodType/threshold
// @desc    Update minimum threshold for blood type (Admin only)
// @access  Private (Admin)
router.put('/:bloodType/threshold', [
  authenticateToken,
  requireAdmin
], async (req, res) => {
  try {
    const { bloodType } = req.params;
    const { minThreshold, maxCapacity } = req.body;

    // Validate blood type
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodTypes.includes(bloodType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blood type'
      });
    }

    // Validate thresholds
    if (minThreshold && (minThreshold < 1 || minThreshold > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Minimum threshold must be between 1 and 100'
      });
    }

    if (maxCapacity && (maxCapacity < 10 || maxCapacity > 1000)) {
      return res.status(400).json({
        success: false,
        message: 'Maximum capacity must be between 10 and 1000'
      });
    }

    if (minThreshold && maxCapacity && minThreshold >= maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Minimum threshold must be less than maximum capacity'
      });
    }

    const updates = {};
    if (minThreshold !== undefined) updates.minThreshold = minThreshold;
    if (maxCapacity !== undefined) updates.maxCapacity = maxCapacity;

    const inventory = await Inventory.findOneAndUpdate(
      { bloodType },
      updates,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Inventory thresholds updated successfully',
      data: { inventory }
    });

  } catch (error) {
    console.error('Update threshold error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during threshold update',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/inventory/alerts/active
// @desc    Get active inventory alerts (Admin only)
// @access  Private (Admin)
router.get('/alerts/active', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const inventory = await Inventory.find({});
    
    // Update all inventories and generate alerts
    await Promise.all(inventory.map(inv => inv.updateExpiredUnits()));
    await Promise.all(inventory.map(inv => inv.generateAlerts()));

    // Collect all active alerts
    const allAlerts = [];
    inventory.forEach(inv => {
      const activeAlerts = inv.alerts.filter(alert => alert.isActive);
      activeAlerts.forEach(alert => {
        allAlerts.push({
          bloodType: inv.bloodType,
          alert: alert
        });
      });
    });

    // Sort by severity and creation date
    allAlerts.sort((a, b) => {
      const severityOrder = { critical: 3, warning: 2, info: 1 };
      const severityDiff = severityOrder[b.alert.severity] - severityOrder[a.alert.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.alert.createdAt) - new Date(a.alert.createdAt);
    });

    res.json({
      success: true,
      data: { 
        alerts: allAlerts,
        summary: {
          total: allAlerts.length,
          critical: allAlerts.filter(a => a.alert.severity === 'critical').length,
          warning: allAlerts.filter(a => a.alert.severity === 'warning').length,
          info: allAlerts.filter(a => a.alert.severity === 'info').length
        }
      }
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/inventory/initialize
// @desc    Initialize inventory for all blood types (Admin only)
// @access  Private (Admin)
router.post('/initialize', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    await Inventory.initializeAllBloodTypes();

    res.json({
      success: true,
      message: 'Inventory initialized for all blood types'
    });

  } catch (error) {
    console.error('Initialize inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during inventory initialization',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/inventory/statistics/summary
// @desc    Get inventory statistics summary (Admin only)
// @access  Private (Admin)
router.get('/statistics/summary', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const inventory = await Inventory.find({});
    
    // Calculate summary statistics
    const summary = {
      totalBloodTypes: inventory.length,
      totalUnits: inventory.reduce((sum, inv) => sum + inv.totalUnits, 0),
      totalAvailable: inventory.reduce((sum, inv) => sum + inv.availableUnits, 0),
      totalReserved: inventory.reduce((sum, inv) => sum + inv.reservedUnits, 0),
      totalExpired: inventory.reduce((sum, inv) => sum + inv.expiredUnits, 0),
      lowStockTypes: inventory.filter(inv => inv.isLowStock()).length,
      criticalStockTypes: inventory.filter(inv => inv.isCriticalStock()).length,
      byBloodType: {}
    };

    // Calculate statistics by blood type
    inventory.forEach(inv => {
      summary.byBloodType[inv.bloodType] = {
        availableUnits: inv.availableUnits,
        totalUnits: inv.totalUnits,
        stockStatus: inv.getStockStatus(),
        stockPercentage: inv.getStockPercentage(),
        statistics: inv.statistics
      };
    });

    // Calculate overall stock health
    const healthyTypes = inventory.filter(inv => inv.getStockStatus() === 'normal' || inv.getStockStatus() === 'high').length;
    summary.overallHealth = {
      percentage: Math.round((healthyTypes / inventory.length) * 100),
      status: healthyTypes >= inventory.length * 0.8 ? 'good' : 
              healthyTypes >= inventory.length * 0.6 ? 'moderate' : 'critical'
    };

    res.json({
      success: true,
      data: { summary }
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
