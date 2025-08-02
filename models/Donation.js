const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor is required']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood type is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [350, 'Minimum donation quantity is 350ml'],
    max: [500, 'Maximum donation quantity is 500ml'],
    default: 450
  },
  donationDate: {
    type: Date,
    required: [true, 'Donation date is required']
  },
  expiryDate: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'collected', 'expired'],
    default: 'pending'
  },
  location: {
    bloodBank: {
      type: String,
      required: [true, 'Blood bank location is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  medicalScreening: {
    hemoglobin: {
      type: Number,
      min: [12.5, 'Hemoglobin level too low for donation']
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    temperature: Number,
    pulse: Number,
    weight: Number,
    screenedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    screeningDate: Date,
    notes: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  rejectionReason: String,
  notes: String,
  isAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate expiry date (35 days from donation date)
donationSchema.pre('save', function(next) {
  if (this.donationDate && !this.expiryDate) {
    this.expiryDate = new Date(this.donationDate.getTime() + (35 * 24 * 60 * 60 * 1000));
  }
  this.updatedAt = Date.now();
  next();
});

// Check if donation is expired
donationSchema.methods.isExpired = function() {
  return new Date() > this.expiryDate;
};

// Update expired donations
donationSchema.pre('find', function() {
  this.where({ expiryDate: { $gte: new Date() } });
});

donationSchema.pre('findOne', function() {
  this.where({ expiryDate: { $gte: new Date() } });
});

// Index for efficient queries
donationSchema.index({ bloodType: 1, status: 1, isAvailable: 1 });
donationSchema.index({ donor: 1, donationDate: -1 });
donationSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Donation', donationSchema);
