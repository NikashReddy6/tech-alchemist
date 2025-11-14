// This file MUST be in 'backend/routes/'

const express = require('express');
const router = express.Router();
// This line loads the 'brain' file.
// If 'services/web3Service.js' doesn't exist, this will crash.
const { issueVC, verifyVC, issuerDid } = require('../services/web3Services');

// This handles '/api/vc/issuer-did'
router.get('/issuer-did', (req, res) => {
  res.json({ did: issuerDid });
});

// This handles '/api/vc/issue'
router.post('/issue', async (req, res) => {
  try {
    const { credentialData, subjectDid } = req.body;
    if (!credentialData || !subjectDid) {
      return res.status(400).json({ message: 'credentialData and subjectDid are required' });
    }
    const vcJwt = await issueVC(credentialData, subjectDid);
    res.status(201).json({ vcJwt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during VC issuance.' });
  }
});

// This handles '/api/vc/verify'
router.post('/verify', async (req, res) => {
  try {
    const { vcJwt } = req.body;
    if (!vcJwt) {
      return res.status(400).json({ message: 'vcJwt is required' });
    }
    const verificationResult = await verifyVC(vcJwt);
    res.status(200).json(verificationResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during VC verification.' });
  }
});

module.exports = router;