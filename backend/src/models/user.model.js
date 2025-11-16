import mongoose from 'mongoose';

/**
 * @typedef {Object} User
 * @property {string} email - User's email address (unique, required)
 * @property {string} password - Hashed password (required)
 * @property {string} firstName - User's first name (required)
 * @property {string} lastName - User's last name (required)
 * @property {string} riskProfile - User's risk tolerance level
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Risk profile enumeration
 * @enum {string}
 */
export const RiskProfile = {
  CONSERVATIVE: 'conservative',
  MODERATE: 'moderate',
  AGGRESSIVE: 'aggressive',
};

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: function() {
        // Password is required only if authProvider is 'local' or not set
        return this.authProvider === 'local' || !this.authProvider;
      },
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password by default
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    riskProfile: {
      type: String,
      enum: {
        values: Object.values(RiskProfile),
        message: 'Risk profile must be one of: conservative, moderate, aggressive',
      },
      default: RiskProfile.MODERATE,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Compound index for common queries
userSchema.index({ email: 1, riskProfile: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

/**
 * User model
 * @type {mongoose.Model<User>}
 */
export const User = mongoose.model('User', userSchema);

