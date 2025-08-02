const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const { 
  authenticateToken, 
  requireDonorOrAdmin, 
  requireAdmin,
  requireOwnershipOrAdmin 
} = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/donations
// @desc    Create a new donation request
// @access  Private (Donor only)
router.post('/', [
  authenticateToken,
  requireDonorOrAdmin,
  body('donationDate')
    .isISO8601()
    .withMessage('Please provide a valid donation date'),
  body('location.bloodBank')
    .notEmpty()
    .withMessage('Blood bank location is required'),
  body('location.address.city')
    .notEmpty()
    .withMessage('City is required'),
  body('quantity')
    .optional()
    .isInt({ min: 350, max: 500 })
    .withMessage('Quantity must be between 350ml and 500ml')
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

    const { donationDate, location, quantity, notes } = req.body;

    // Check if user is eligible for donation
    const donor = await User.findById(req.user._id);
    const eligibility = donor.isDonationEligible();
    
    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: eligibility.reason
      });
    }

    // Calculate expiry date (35 days from donation date)
    const donationDateObj = new Date(donationDate);
    const expiryDate = new Date(donationDateObj.getTime() + (35 * 24 * 60 * 60 * 1000));

    // Create donation
    const donation = new Donation({
      donor: req.user._id,
      bloodType: donor.bloodType,
      donationDate: donationDateObj,
      expiryDate: expiryDate,
      location,
      quantity: quantity || 450,
      notes
    });

    await donation.save();

    // Populate donor information
    await donation.populate('donor', 'name email phone bloodType');

    res.status(201).json({
      success: true,
      message: 'Donation request created successfully',
      data: { donation }
    });

  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during donation creation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/donations
// @desc    Get donations (filtered by user role)
// @access  Private
router.get('/', [
  authenticateToken,
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'collected', 'expired'])
    .withMessage('Invalid status'),
  query('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
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

    const { status, bloodType, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'donor') {
      // Donors can only see their own donations
      query.donor = req.user._id;
    } else if (req.user.role === 'recipient') {
      // Recipients can see approved and available donations
      query.status = { $in: ['approved', 'collected'] };
      query.isAvailable = true;
    }
    // Admins can see all donations

    // Apply filters
    if (status) query.status = status;
    if (bloodType) query.bloodType = bloodType;

    const donations = await Donation.find(query)
      .populate('donor', 'name email phone bloodType address')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      data: {
        donations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donations',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/donations/:id
// @desc    Get single donation
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone bloodType address')
      .populate('approvedBy', 'name email');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'donor' && donation.donor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { donation }
    });

  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/donations/:id
// @desc    Update donation (donor can update pending donations)
// @access  Private
router.put('/:id', [
  authenticateToken,
  body('donationDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid donation date'),
  body('location.bloodBank')
    .optional()
    .notEmpty()
    .withMessage('Blood bank location cannot be empty'),
  body('quantity')
    .optional()
    .isInt({ min: 350, max: 500 })
    .withMessage('Quantity must be between 350ml and 500ml')
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

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow updates to pending donations
    if (donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending donations'
      });
    }

    const allowedUpdates = ['donationDate', 'location', 'quantity', 'notes'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('donor', 'name email phone bloodType');

    res.json({
      success: true,
      message: 'Donation updated successfully',
      data: { donation: updatedDonation }
    });

  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during donation update',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   DELETE /api/donations/:id
// @desc    Cancel donation (only pending donations)
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow cancellation of pending donations
    if (donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending donations'
      });
    }

    await Donation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Donation cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during donation cancellation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/donations/:id/approve
// @desc    Approve donation (Admin only)
// @access  Private (Admin)
router.post('/:id/approve', [
  authenticateToken,
  requireAdmin,
  body('medicalScreening.hemoglobin')
    .isFloat({ min: 12.5 })
    .withMessage('Hemoglobin level must be at least 12.5 g/dL'),
  body('medicalScreening.weight')
    .isFloat({ min: 45 })
    .withMessage('Weight must be at least 45 kg')
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

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only approve pending donations'
      });
    }

    // Update donation
    donation.status = 'approved';
    donation.approvedBy = req.user._id;
    donation.approvalDate = new Date();
    donation.medicalScreening = {
      ...req.body.medicalScreening,
      screenedBy: req.user._id,
      screeningDate: new Date()
    };
    donation.isAvailable = true;

    await donation.save();

    // Update donor's last donation date
    await User.findByIdAndUpdate(donation.donor, {
      'medicalInfo.lastDonation': donation.donationDate
    });

    // Add to inventory
    const inventory = await Inventory.findOne({ bloodType: donation.bloodType });
    if (inventory) {
      await inventory.addDonation(donation._id, donation.quantity, donation.expiryDate);
    }

    await donation.populate('donor', 'name email phone bloodType');

    res.json({
      success: true,
      message: 'Donation approved successfully',
      data: { donation }
    });

  } catch (error) {
    console.error('Approve donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during donation approval',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/donations/:id/reject
// @desc    Reject donation (Admin only)
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

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only reject pending donations'
      });
    }

    // Update donation
    donation.status = 'rejected';
    donation.approvedBy = req.user._id;
    donation.approvalDate = new Date();
    donation.rejectionReason = req.body.rejectionReason;

    await donation.save();
    await donation.populate('donor', 'name email phone bloodType');

    res.json({
      success: true,
      message: 'Donation rejected',
      data: { donation }
    });

  } catch (error) {
    console.error('Reject donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during donation rejection',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/donations/eligibility/check
// @desc    Check donation eligibility for current user
// @access  Private (Donor)
router.get('/eligibility/check', [authenticateToken, requireDonorOrAdmin], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const eligibility = user.isDonationEligible();

    res.json({
      success: true,
      data: { eligibility }
    });

  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking eligibility',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
