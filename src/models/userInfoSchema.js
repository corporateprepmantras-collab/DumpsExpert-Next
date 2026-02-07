// ============================================
// FILE: /models/userInfoSchema.js (SECURE VERSION)
// ============================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userInfoSchema = new mongoose.Schema(
  {
    // ========================================
    // CORE FIELDS
    // ========================================
    authUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },

    password: {
      type: String,
      required: true,
      select: false, // Don't return password in queries by default
      minlength: [6, "Password must be at least 6 characters"],
    },

    name: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["guest", "student", "admin"],
      default: "guest",
      index: true,
    },

    subscription: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
      index: true,
    },

    // ========================================
    // OAUTH FIELDS
    // ========================================
    provider: {
      type: String,
      default: "credentials",
      enum: ["credentials", "google", "facebook"],
    },

    providerId: {
      type: String,
    },

    // ========================================
    // VERIFICATION
    // ========================================
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // ========================================
    // PROFILE FIELDS
    // ========================================
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    dob: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },

    profileImage: {
      type: String,
      default: "",
    },

    // ========================================
    // SECURITY FIELDS (NEW)
    // ========================================
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lastFailedLogin: {
      type: Date,
    },

    lastSuccessfulLogin: {
      type: Date,
    },

    lastLoginIP: {
      type: String,
    },

    accountLocked: {
      type: Boolean,
      default: false,
    },

    lockUntil: {
      type: Date,
    },

    passwordChangedAt: {
      type: Date,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ========================================
    // LOGIN HISTORY (Last 50 logins)
    // ========================================
    loginHistory: [
      {
        ip: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        success: {
          type: Boolean,
          required: true,
        },
        userAgent: {
          type: String,
        },
        provider: {
          type: String,
          default: "credentials",
        },
      },
    ],

    // ========================================
    // TIMESTAMPS
    // ========================================
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  },
);

// ========================================
// INDEXES FOR PERFORMANCE
// ========================================
userInfoSchema.index({ email: 1, isVerified: 1 });
userInfoSchema.index({ role: 1, subscription: 1 });
userInfoSchema.index({ accountLocked: 1, lockUntil: 1 });

// ========================================
// PRE-SAVE MIDDLEWARE (Password Hashing)
// ========================================
userInfoSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (this.isModified("password") && this.password) {
    try {
      // Validate password strength
      if (this.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Hash password with bcrypt (10 rounds)
      this.password = await bcrypt.hash(this.password, 10);

      // Update passwordChangedAt timestamp
      if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000; // Subtract 1 sec to ensure JWT is created after password change
      }

      console.log("✅ Password hashed successfully");
    } catch (error) {
      console.error("❌ Password hashing failed:", error);
      return next(error);
    }
  }

  // Update updatedAt timestamp
  this.updatedAt = Date.now();

  next();
});

// ========================================
// INSTANCE METHODS
// ========================================

// Compare password for login
userInfoSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    if (!this.password) {
      throw new Error("Password not found");
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("❌ Password comparison failed:", error);
    return false;
  }
};

// Check if account is currently locked
userInfoSchema.methods.isAccountLocked = function () {
  return this.accountLocked && this.lockUntil && this.lockUntil > Date.now();
};

// Increment failed login attempts
userInfoSchema.methods.incrementFailedAttempts = async function () {
  // If account is already locked and lock time expired, reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: {
        failedLoginAttempts: 1,
        lastFailedLogin: Date.now(),
        accountLocked: false,
        lockUntil: null,
      },
    });
  }

  // Increment failed attempts
  const updates = {
    $inc: { failedLoginAttempts: 1 },
    $set: { lastFailedLogin: Date.now() },
  };

  // Lock account after 5 failed attempts
  if (this.failedLoginAttempts + 1 >= 5 && !this.accountLocked) {
    updates.$set.accountLocked = true;
    updates.$set.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
    console.warn("⚠️ Account locked after 5 failed attempts:", this.email);
  }

  return this.updateOne(updates);
};

// Reset failed login attempts on successful login
userInfoSchema.methods.resetFailedAttempts = async function (ip, userAgent) {
  const updates = {
    $set: {
      failedLoginAttempts: 0,
      lastSuccessfulLogin: Date.now(),
      lastLoginIP: ip,
      accountLocked: false,
      lockUntil: null,
    },
    $push: {
      loginHistory: {
        $each: [
          {
            ip: ip,
            timestamp: Date.now(),
            success: true,
            userAgent: userAgent,
            provider: this.provider,
          },
        ],
        $slice: -50, // Keep only last 50 login records
      },
    },
  };

  return this.updateOne(updates);
};

// Check if password was changed after JWT token was issued
userInfoSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Create password reset token
userInfoSchema.methods.createPasswordResetToken = function () {
  const crypto = require("crypto");
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Create email verification token
userInfoSchema.methods.createEmailVerificationToken = function () {
  const crypto = require("crypto");
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// ========================================
// STATIC METHODS
// ========================================

// Find user by email (includes password field)
userInfoSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select("+password");
};

// Find active users (verified and not locked)
userInfoSchema.statics.findActiveUsers = function () {
  return this.find({
    isVerified: true,
    accountLocked: false,
  });
};

// Get user statistics
userInfoSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        role: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);

  const verified = await this.countDocuments({ isVerified: true });
  const locked = await this.countDocuments({ accountLocked: true });
  const withSubscription = await this.countDocuments({ subscription: "yes" });

  return {
    byRole: stats,
    verified,
    locked,
    withSubscription,
    total: await this.countDocuments(),
  };
};

// ========================================
// VIRTUAL FIELDS
// ========================================

// Virtual for full name (if you split first/last name later)
userInfoSchema.virtual("accountAge").get(function () {
  if (!this.createdAt) return 0;
  return Math.floor(
    (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );
});

// ========================================
// EXPORT MODEL
// ========================================
module.exports =
  mongoose.models.UserInfo || mongoose.model("UserInfo", userInfoSchema);
