const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['donor', 'recipient', 'admin'],
    required: [true, 'Role is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood type is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  address: {
    type: String,
    required: false
  },
  emergencyContact: {
    type: String,
    required: false
  },
  emergencyContactPhone: {
    type: String,
    required: false
  },
  medicalConditions: {
    type: String,
    required: false
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  donationReminders: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  medicalInfo: {
    weight: { type: Number, min: 45 }, // Minimum weight for donation
    lastDonation: { type: Date },
    medicalConditions: [String],
    medications: [String],
    allergies: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
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
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check donation eligibility
userSchema.methods.isDonationEligible = function() {
  const now = new Date();
  const age = Math.floor((now - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
  
  // Basic eligibility criteria
  if (age < 18 || age > 65) return { eligible: false, reason: 'Age must be between 18-65 years' };
  if (this.medicalInfo.weight < 45) return { eligible: false, reason: 'Weight must be at least 45 kg' };
  
  // Check last donation date (must be at least 56 days ago)
  if (this.medicalInfo.lastDonation) {
    const daysSinceLastDonation = Math.floor((now - this.medicalInfo.lastDonation) / (24 * 60 * 60 * 1000));
    if (daysSinceLastDonation < 56) {
      return { 
        eligible: false, 
        reason: `Must wait ${56 - daysSinceLastDonation} more days since last donation` 
      };
    }
  }
  
  return { eligible: true, reason: 'Eligible for donation' };
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
