// This file MUST be in 'backend/models/User.js'

const mongoose = require('mongoose');

// This is the "blueprint" for a User in our MongoDB database
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // No two users can have the same email
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  // This is the CRITICAL link
  did: {
    type: String,
    unique: true,
    sparse: true // Allows this field to be null or empty for new users
  }
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt'

const User = mongoose.model('User', UserSchema);
module.exports = User;