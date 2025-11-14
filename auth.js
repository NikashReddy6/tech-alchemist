// This file MUST be in 'backend/routes/auth.js'
// This is the FIXED version

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- THIS IS THE FIX ---
// The path must be '../models/User' (two dots)
// This tells the file to "go UP one folder, then DOWN into models"
const User = require('../models/User'); 
// --- END OF FIX ---

// --- /api/auth/register ---
router.post('/register', async (req, res) => {
  console.log('API: /api/auth/register hit'); 
  const { email, password } = req.body;

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Email and password (min 6 chars) are required' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log('Register Error: User already exists'); 
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Register: Hashing password...'); 
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('Register: Creating new user in DB...'); 
    user = new User({ email, passwordHash });
    await user.save();
    console.log('Register: User saved to DB.'); 

    const payload = { user: { id: user.id } };
    
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL ERROR: JWT_SECRET is not defined in .env file!");
      return res.status(500).json({ message: "Server configuration error: JWT_SECRET is missing." });
    }
    
    console.log('Register: Signing JWT token...'); 
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });
    console.log('Register: Success!'); 

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email }
    });

  } catch (err) {
    console.error("Register Error:", err.message, err.stack); 
    res.status(500).send('Server Error: ' + err.message);
  }
});

// --- /api/auth/login ---
router.post('/login', async (req, res) => {
  console.log('API: /api/auth/login hit'); 
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login Error: User not found'); 
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log('Login Error: Password mismatch'); 
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL ERROR: JWT_SECRET is not defined in .env file!");
      return res.status(500).json({ message: "Server configuration error: JWT_SECRET is missing." });
    }

    console.log('Login: Success! Signing token.'); 
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });

    res.json({
      token,
      user: { id: user.id, email: user.email, did: user.did }
    });

  } catch (err) {
    console.error("Login Error:", err.message, err.stack);
    res.status(500).send('Server Error: ' + err.message);
  }
});

module.exports = router;