const express = require('express');
const router = express.Router();
const { protect, requireRole, requireVerified } = require('../middleware/authMiddleware');
const { getPharmacy, upsertPharmacy } = require('../controllers/pharmacyController');

router.use(protect, requireRole('vendor'));

// GET is allowed for unverified vendors (they need to see their shop info)
router.get('/',  getPharmacy);

// PUT (update shop) requires verification
router.put('/',  requireVerified, upsertPharmacy);

module.exports = router;
