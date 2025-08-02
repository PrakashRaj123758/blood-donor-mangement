const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Request = require('../models/Request');
const Donation = require('../models/Donation');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const { 
  authenticateToken, 
  requireRecipientOrAdmin, 
  requireAdmin 
} = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/requests
// @desc    Create a new blood request
// @access  Private (Recipient only)
router.post('/', [
  authenticateToken,
  requireRecipientOrAdmin,
  body('bloodType')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood type'),
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10 units'),
  body('urgency')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Urgency must be low, medium, high, or critical'),
  body('requiredBy')
    .isISO8601()
    .withMessage('Please provide a valid required by date'),
  body('reason')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('hospital.name')
    .notEmpty()
    .withMessage('Hospital name is required'),
  body('hospital.contactNumber')
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Please provide a valid contact number (10-15 digits)')
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

    const {
      bloodType, quantity, urgency, requiredBy,
      reason, hospital
    } = req.body;

    // Validate required by date (must be in the future)
    const requiredByDate = new Date(requiredBy);
    if (requiredByDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Required by date must be in the future'
      });
    }

    // Create blood request
    const bloodRequest = new Request({
      recipient: req.user._id,
      bloodType,
      quantity,
      urgency,
      requiredBy: requiredByDate,
      reason,
      hospital
    });

    await bloodRequest.save();

    // Populate recipient information
    await bloodRequest.populate('recipient', 'name email phone bloodType');

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: { request: bloodRequest }
    });

  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during request creation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/requests
// @desc    Get blood requests (filtered by user role)
// @access  Private
router.get('/', [
  authenticateToken,
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected', 'expired'])
    .withMessage('Invalid status'),
  query('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
  query('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid urgency level'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
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

    const { status, bloodType, urgency, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'recipient') {
      // Recipients can only see their own requests
      query.recipient = req.user._id;
    } else if (req.user.role === 'donor') {
      // Donors can see approved requests that match their blood type compatibility
      const donor = await User.findById(req.user._id);
      const compatibleTypes = getCompatibleBloodTypes(donor.bloodType);
      query.bloodType = { $in: compatibleTypes };
      query.status = { $in: ['approved', 'partially_fulfilled'] };
    }
    // Admins can see all requests

    // Apply filters
    if (status) query.status = status;
    if (bloodType) query.bloodType = bloodType;
    if (urgency) query.urgency = urgency;

    const requests = await Request.find(query)
      .populate('recipient', 'name email phone bloodType address')
      .populate('approvedBy', 'name email')
      .populate('assignedDonations.donation', 'donor quantity donationDate')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Request.countDocuments(query);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching requests',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/requests/:id
// @desc    Get single blood request
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const bloodRequest = await Request.findById(req.params.id)
      .populate('recipient', 'name email phone bloodType address')
      .populate('approvedBy', 'name email')
      .populate({
        path: 'assignedDonations.donation',
        populate: {
          path: 'donor',
          select: 'name email phone bloodType'
        }
      });

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'recipient' && 
        bloodRequest.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { request: bloodRequest }
    });

  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching request',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/requests/:id
// @desc    Update blood request (recipient can update pending requests)
// @access  Private
router.put('/:id', [
  authenticateToken,
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10 units'),
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Urgency must be low, medium, high, or critical'),
  body('requiredBy')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid required by date')
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

    const bloodRequest = await Request.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        bloodRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow updates to pending requests
    if (bloodRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending requests'
      });
    }

    const allowedUpdates = ['quantity', 'urgency', 'requiredBy', 'reason', 'hospital', 'notes'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Validate required by date if provided
    if (updates.requiredBy && new Date(updates.requiredBy) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Required by date must be in the future'
      });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('recipient', 'name email phone bloodType');

    res.json({
      success: true,
      message: 'Blood request updated successfully',
      data: { request: updatedRequest }
    });

  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during request update',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Cancel blood request (only pending requests)
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const bloodRequest = await Request.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        bloodRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow cancellation of pending requests
    if (bloodRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending requests'
      });
    }

    await Request.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Blood request cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during request cancellation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/requests/:id/approve
// @desc    Approve blood request (Admin only)
// @access  Private (Admin)
router.post('/:id/approve', [
  authenticateToken,
  requireAdmin
], async (req, res) => {
  try {
    const bloodRequest = await Request.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    if (bloodRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only approve pending requests'
      });
    }

    // Update request
    bloodRequest.status = 'approved';
    bloodRequest.approvedBy = req.user._id;
    bloodRequest.approvalDate = new Date();

    await bloodRequest.save();
    await bloodRequest.populate('recipient', 'name email phone bloodType');

    res.json({
      success: true,
      message: 'Blood request approved successfully',
      data: { request: bloodRequest }
    });

  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during request approval',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/requests/:id/reject
// @desc    Reject blood request (Admin only)
// @access  Private (Admin)
router.post('/:id/reject', [
  authenticateToken,
  requireAdmin,
  body('rejectionReason')
    .notEmpty()
    .withMessage('Rejection reason is required')
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

    const bloodRequest = await Request.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    if (bloodRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only reject pending requests'
      });
    }

    // Update request
    bloodRequest.status = 'rejected';
    bloodRequest.approvedBy = req.user._id;
    bloodRequest.approvalDate = new Date();
    bloodRequest.rejectionReason = req.body.rejectionReason;

    await bloodRequest.save();
    await bloodRequest.populate('recipient', 'name email phone bloodType');

    res.json({
      success: true,
      message: 'Blood request rejected',
      data: { request: bloodRequest }
    });

  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during request rejection',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/requests/:id/assign-donation
// @desc    Assign donation to blood request (Admin only)
// @access  Private (Admin)
router.post('/:id/assign-donation', [
  authenticateToken,
  requireAdmin,
  body('donationId')
    .isMongoId()
    .withMessage('Valid donation ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
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

    const { donationId, quantity } = req.body;

    const bloodRequest = await Request.findById(req.params.id);
    const donation = await Donation.findById(donationId);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Validate assignment
    if (bloodRequest.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Can only assign donations to approved requests'
      });
    }

    if (donation.status !== 'approved' || !donation.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Donation is not available for assignment'
      });
    }

    // Check blood type compatibility
    const compatibleTypes = bloodRequest.getCompatibleBloodTypes();
    if (!compatibleTypes.includes(donation.bloodType)) {
      return res.status(400).json({
        success: false,
        message: 'Blood types are not compatible'
      });
    }

    // Check if enough quantity is available
    const remainingQuantity = bloodRequest.quantity - bloodRequest.fulfilledQuantity;
    const assignQuantity = Math.min(quantity, remainingQuantity, donation.quantity);

    // Assign donation
    bloodRequest.assignedDonations.push({
      donation: donationId,
      quantity: assignQuantity
    });

    bloodRequest.fulfilledQuantity += assignQuantity;

    // Update status based on fulfillment
    if (bloodRequest.fulfilledQuantity >= bloodRequest.quantity) {
      bloodRequest.status = 'fulfilled';
    } else {
      bloodRequest.status = 'partially_fulfilled';
    }

    await bloodRequest.save();

    // Update donation availability
    donation.isAvailable = false;
    donation.status = 'collected';
    await donation.save();

    // Update inventory
    const inventory = await Inventory.findOne({ bloodType: donation.bloodType });
    if (inventory) {
      await inventory.fulfillReservation(bloodRequest._id, assignQuantity);
    }

    await bloodRequest.populate([
      { path: 'recipient', select: 'name email phone bloodType' },
      { path: 'assignedDonations.donation', select: 'donor quantity donationDate' }
    ]);

    res.json({
      success: true,
      message: 'Donation assigned successfully',
      data: { request: bloodRequest }
    });

  } catch (error) {
    console.error('Assign donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during donation assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Helper function to get compatible blood types for donation
function getCompatibleBloodTypes(donorBloodType) {
  const compatibility = {
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-'],
    'O+': ['A+', 'B+', 'AB+', 'O+'], // Universal donor for positive types
    'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] // Universal donor
  };
  
  return compatibility[donorBloodType] || [];
}

module.exports = router;
