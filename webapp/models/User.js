const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    }, // user's email
    passwordHash: {
      type: String,
      required: false 
    }, // hashed password
    displayName: {
      type: String,
      trim: true
    },

    // Profile picture URL served from /public/uploads
    avatarUrl: {
      type: String,
      trim: true
    },

    // auth provider
    githubId: {
      type: String,
      index: true,
      sparse: true
    },
    googleId: {
      type: String,
      index: true,
      sparse: true
    },

    // Optional password reset token fields
    resetToken: String,
    resetTokenExpiresAt: Date
  },

  {
    timestamps: true
  }
);

// uses the user selection in mongodb database. 
module.exports = mongoose.model('User', userSchema);