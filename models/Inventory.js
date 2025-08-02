const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood type is required'],
    unique: true
  },
  totalUnits: {
    type: Number,
    default: 0,
    min: [0, 'Total units cannot be negative']
  },
  availableUnits: {
    type: Number,
    default: 0,
    min: [0, 'Available units cannot be negative']
  },
  reservedUnits: {
    type: Number,
    default: 0,
    min: [0, 'Reserved units cannot be negative']
  },
  expiredUnits: {
    type: Number,
    default: 0,
    min: [0, 'Expired units cannot be negative']
  },
  minThreshold: {
    type: Number,
    default: 10,
    min: [1, 'Minimum threshold must be at least 1']
  },
  maxCapacity: {
    type: Number,
    default: 100,
    min: [1, 'Maximum capacity must be at least 1']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  donations: [{
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation'
    },
    quantity: Number,
    addedDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date,
    status: {
      type: String,
      enum: ['available', 'reserved', 'used', 'expired'],
      default: 'available'
    }
  }],
  requests: [{
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request'
    },
    quantity: Number,
    reservedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['reserved', 'fulfilled', 'cancelled'],
      default: 'reserved'
    }
  }],
  statistics: {
    totalDonationsReceived: {
      type: Number,
      default: 0
    },
    totalUnitsDispensed: {
      type: Number,
      default: 0
    },
    totalUnitsExpired: {
      type: Number,
      default: 0
    },
    averageShelfLife: {
      type: Number,
      default: 35 // days
    }
  },
  alerts: [{
    type: {
      type: String,
      enum: ['low_stock', 'expiring_soon', 'expired', 'high_demand'],
      required: true
    },
    message: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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
inventorySchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  this.updatedAt = Date.now();
  
  // Validate that available + reserved + expired = total
  const calculatedTotal = this.availableUnits + this.reservedUnits + this.expiredUnits;
  if (Math.abs(calculatedTotal - this.totalUnits) > 0.01) {
    this.totalUnits = calculatedTotal;
  }
  
  next();
});

// Check if stock is low
inventorySchema.methods.isLowStock = function() {
  return this.availableUnits <= this.minThreshold;
};

// Check if stock is critical (less than half of minimum threshold)
inventorySchema.methods.isCriticalStock = function() {
  return this.availableUnits <= Math.floor(this.minThreshold / 2);
};

// Get stock level status
inventorySchema.methods.getStockStatus = function() {
  if (this.isCriticalStock()) return 'critical';
  if (this.isLowStock()) return 'low';
  if (this.availableUnits >= this.maxCapacity * 0.8) return 'high';
  return 'normal';
};

// Calculate stock percentage
inventorySchema.methods.getStockPercentage = function() {
  return Math.round((this.availableUnits / this.maxCapacity) * 100);
};

// Add donation to inventory
inventorySchema.methods.addDonation = function(donationId, quantity, expiryDate) {
  this.donations.push({
    donation: donationId,
    quantity: quantity,
    expiryDate: expiryDate,
    status: 'available'
  });
  
  this.availableUnits += quantity;
  this.totalUnits += quantity;
  this.statistics.totalDonationsReceived += 1;
  
  // Clear low stock alerts if stock is now adequate
  if (!this.isLowStock()) {
    this.alerts = this.alerts.filter(alert => 
      alert.type !== 'low_stock' || !alert.isActive
    );
  }
  
  return this.save();
};

// Reserve units for a request
inventorySchema.methods.reserveUnits = function(requestId, quantity) {
  if (this.availableUnits < quantity) {
    throw new Error('Insufficient available units');
  }
  
  this.requests.push({
    request: requestId,
    quantity: quantity,
    status: 'reserved'
  });
  
  this.availableUnits -= quantity;
  this.reservedUnits += quantity;
  
  return this.save();
};

// Fulfill reserved units
inventorySchema.methods.fulfillReservation = function(requestId, quantity) {
  const reservation = this.requests.find(req => 
    req.request.toString() === requestId.toString() && 
    req.status === 'reserved'
  );
  
  if (!reservation) {
    throw new Error('Reservation not found');
  }
  
  if (reservation.quantity < quantity) {
    throw new Error('Cannot fulfill more than reserved quantity');
  }
  
  reservation.status = 'fulfilled';
  this.reservedUnits -= quantity;
  this.statistics.totalUnitsDispensed += quantity;
  
  return this.save();
};

// Update expired units
inventorySchema.methods.updateExpiredUnits = function() {
  const now = new Date();
  let expiredCount = 0;
  
  this.donations.forEach(donation => {
    if (donation.status === 'available' && donation.expiryDate < now) {
      donation.status = 'expired';
      expiredCount += donation.quantity;
    }
  });
  
  if (expiredCount > 0) {
    this.availableUnits -= expiredCount;
    this.expiredUnits += expiredCount;
    this.statistics.totalUnitsExpired += expiredCount;
    
    // Add expired alert
    this.alerts.push({
      type: 'expired',
      message: `${expiredCount} units of ${this.bloodType} blood have expired`,
      severity: 'warning'
    });
  }
  
  return this.save();
};

// Generate alerts based on current status
inventorySchema.methods.generateAlerts = function() {
  // Clear old alerts
  this.alerts = this.alerts.filter(alert => 
    alert.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000) // Keep alerts for 24 hours
  );
  
  // Low stock alert
  if (this.isLowStock()) {
    const severity = this.isCriticalStock() ? 'critical' : 'warning';
    this.alerts.push({
      type: 'low_stock',
      message: `${this.bloodType} blood stock is ${severity === 'critical' ? 'critically' : ''} low (${this.availableUnits} units remaining)`,
      severity: severity
    });
  }
  
  // Expiring soon alert (within 7 days)
  const soonToExpire = this.donations.filter(donation => {
    const daysUntilExpiry = Math.ceil((donation.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    return donation.status === 'available' && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  });
  
  if (soonToExpire.length > 0) {
    const totalExpiring = soonToExpire.reduce((sum, donation) => sum + donation.quantity, 0);
    this.alerts.push({
      type: 'expiring_soon',
      message: `${totalExpiring} units of ${this.bloodType} blood will expire within 7 days`,
      severity: 'warning'
    });
  }
  
  return this.save();
};

// Static method to initialize all blood types
inventorySchema.statics.initializeAllBloodTypes = async function() {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  for (const bloodType of bloodTypes) {
    await this.findOneAndUpdate(
      { bloodType },
      { 
        bloodType,
        totalUnits: 0,
        availableUnits: 0,
        reservedUnits: 0,
        expiredUnits: 0
      },
      { upsert: true, new: true }
    );
  }
};

// Index for efficient queries
inventorySchema.index({ bloodType: 1 });
inventorySchema.index({ availableUnits: 1 });
inventorySchema.index({ lastUpdated: -1 });

module.exports = mongoose.model('Inventory', inventorySchema);
