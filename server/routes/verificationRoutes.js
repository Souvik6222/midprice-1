const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, requireRole } = require('../middleware/authMiddleware');
const User = require('../models/User');

/* ─── Multer config: Store license images ─── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'licenses')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `license_${req.user._id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only JPG, PNG, PDF files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

/* ─── Vendor: Upload Drug License ─── */
// POST /api/vendor/verification/upload-license
router.post(
  '/upload-license',
  protect,
  requireRole('vendor'),
  upload.single('license'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a license file (JPG, PNG, or PDF).' });
      }

      const user = await User.findById(req.user._id);
      user.licenseUrl = `/uploads/licenses/${req.file.filename}`;
      user.verificationStatus = 'pending';
      await user.save();

      res.json({
        message: 'License uploaded successfully! Your account is under review.',
        licenseUrl: user.licenseUrl,
        verificationStatus: 'pending',
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* ─── Vendor: Get verification status ─── */
// GET /api/vendor/verification/status
router.get('/status', protect, requireRole('vendor'), async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    isVerified: user.isVerified,
    verificationStatus: user.verificationStatus,
    licenseUrl: user.licenseUrl,
    rejectionReason: user.rejectionReason,
  });
});

/* ─── Admin: List pending vendors ─── */
// GET /api/vendor/verification/admin/pending?secret=YOUR_ADMIN_SECRET
router.get('/admin/pending', async (req, res) => {
  const { secret } = req.query;
  if (secret !== (process.env.ADMIN_SECRET || 'medprice-admin-2026')) {
    return res.status(401).json({ message: 'Invalid admin secret.' });
  }

  const pending = await User.find({ role: 'vendor', verificationStatus: 'pending' })
    .select('name phone licenseUrl verificationStatus createdAt');
  res.json({ count: pending.length, vendors: pending });
});

/* ─── Admin: Approve a vendor ─── */
// POST /api/vendor/verification/admin/approve/:userId?secret=YOUR_ADMIN_SECRET
router.post('/admin/approve/:userId', async (req, res) => {
  const { secret } = req.query;
  if (secret !== (process.env.ADMIN_SECRET || 'medprice-admin-2026')) {
    return res.status(401).json({ message: 'Invalid admin secret.' });
  }

  const user = await User.findById(req.params.userId);
  if (!user || user.role !== 'vendor') {
    return res.status(404).json({ message: 'Vendor not found.' });
  }

  user.isVerified = true;
  user.verificationStatus = 'approved';
  user.rejectionReason = '';
  await user.save();

  res.json({ message: `Vendor "${user.name}" (${user.phone}) approved!`, user: { id: user._id, name: user.name, phone: user.phone, isVerified: true } });
});

/* ─── Admin: Reject a vendor ─── */
// POST /api/vendor/verification/admin/reject/:userId?secret=YOUR_ADMIN_SECRET
router.post('/admin/reject/:userId', async (req, res) => {
  const { secret } = req.query;
  if (secret !== (process.env.ADMIN_SECRET || 'medprice-admin-2026')) {
    return res.status(401).json({ message: 'Invalid admin secret.' });
  }

  const user = await User.findById(req.params.userId);
  if (!user || user.role !== 'vendor') {
    return res.status(404).json({ message: 'Vendor not found.' });
  }

  user.isVerified = false;
  user.verificationStatus = 'rejected';
  user.rejectionReason = req.body.reason || 'License could not be verified.';
  await user.save();

  res.json({ message: `Vendor "${user.name}" rejected.`, reason: user.rejectionReason });
});

module.exports = router;
