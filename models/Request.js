const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood type is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Minimum quantity is 1 unit'],
    max: [10, 'Maximum quantity is 10 units']
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: [true, 'Urgency level is required'],
    default: 'medium'
  },
  requiredBy: {
    type: Date,
    required: [true, 'Required by date is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason for blood request is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  hospital: {
    name: {
      type: String,
      required: [true, 'Hospital name is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    contactNumber: {
      type: String,
      required: [true, 'Hospital contact number is required']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected', 'expired'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  rejectionReason: String,
  fulfilledQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  assignedDonations: [{
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation'
    },
    quantity: Number,
    assignedDate: {
      type: Date,
      default: Date.now
    }
  }],
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  notes: String,
  isActive: {
    type: Boolean,
    default: true
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

// Update the updatedAt field before saving
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set priority based on urgency and required date
  const now = new Date();
  const daysUntilRequired = Math.ceil((this.requiredBy - now) / (1000 * 60 * 60 * 24));
  
  let priorityScore = 5; // Base priority
  
  // Adjust based on urgency
  switch (this.urgency) {
    case 'critical':
      priorityScore = 10;
      break;
    case 'high':
      priorityScore = 8;
      break;
    case 'medium':
      priorityScore = 5;
      break;
    case 'low':
      priorityScore = 3;
      break;
  }
  
  // Adjust based on time sensitivity
  if (daysUntilRequired <= 1) priorityScore = Math.min(10, priorityScore + 3);
  else if (daysUntilRequired <= 3) priorityScore = Math.min(10, priorityScore + 2);
  else if (daysUntilRequired <= 7) priorityScore = Math.min(10, priorityScore + 1);
  
  this.priority = priorityScore;
  next();
});

// Check if request is expired
requestSchema.methods.isExpired = function() {
  return new Date() > this.requiredBy && this.status === 'pending';
};

// Calculate fulfillment percentage
requestSchema.methods.getFulfillmentPercentage = function() {
  return Math.round((this.fulfilledQuantity / this.quantity) * 100);
};

// Get compatible blood types for this request
requestSchema.methods.getCompatibleBloodTypes = function() {
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };
  
  return compatibility[this.bloodType] || [this.bloodType];
};

// Index for efficient queries
requestSchema.index({ bloodType: 1, status: 1, urgency: 1 });
requestSchema.index({ recipient: 1, createdAt: -1 });
requestSchema.index({ requiredBy: 1, status: 1 });
requestSchema.index({ priority: -1, createdAt: 1 });

module.exports = mongoose.model('Request', requestSchema);
