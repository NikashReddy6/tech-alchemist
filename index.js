// This file MUST be in the 'backend' folder
// This is the FINAL, "NO-CRASH" version

// This line MUST be first, to read the .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // We need this module

// --- Create App ---
const app = express();
// We get the PORT from our .env file, or default to 5000
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(express.json()); 
// This is the "Allow Anyone" CORS fix
app.use(cors()); 

// --- Serve Static Files ---
// This serves your (empty) 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes (The "Web 2.0" parts) ---
// These are loaded first.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));

// --- Start Server ---
// We start the server *before* loading the dangerous Web3 code
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
  
  // --- Database Connection ---
  // We connect to the DB *after* the server is live
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("✅ MongoDB Connected");

      // --- Initialize Web3 ---
      // NOW, we try to load the "Web3 Brain"
      try {
        // This will try to load web3Service.js
        // This file *itself* has console.logs for success or error
        const { initializeWeb3 } = require('./services/web3Service');
        initializeWeb3(); // This will print its own success or error
        
        // And *now* we load the Web3 routes
        app.use('/api/vc', require('./routes/vc'));
        console.log("✅ VC (Web3) routes loaded.");
        
      } catch (err) {
        console.error("❌ CRITICAL: Failed to load Web3 services.", err.message);
      }
      
    })
    .catch(err => {
      console.error("❌ MongoDB Connection Error:", err.message);
    });
});