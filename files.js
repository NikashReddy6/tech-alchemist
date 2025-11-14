// backend/routes/files.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const { uploadFileToIPFS } = require('../services/ipfsService'); // FIXED PATH

// ----------------------------
// Multer Configuration
// ----------------------------
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// ----------------------------
// POST /api/files/upload
// Protected Route
// ----------------------------
router.post('/upload', auth, upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Upload to IPFS
    const ipfsHash = await uploadFileToIPFS(filePath, fileName);

    // Delete temp file
    try { fs.unlinkSync(filePath); } catch (e) { console.warn("Temp cleanup failed:", e); }

    res.status(201).json({
      message: 'File uploaded successfully to IPFS',
      ipfsHash,
      fileName,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size
    });

  } catch (err) {
    console.error('File Upload Error:', err);
    res.status(500).json({ message: 'Server error during file upload.' });
  }
});

module.exports = router;
