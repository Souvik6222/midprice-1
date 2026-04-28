const express = require('express');
const router = express.Router();
const {
  searchMedicines,
  getMedicinePrices,
  getAllMedicines,
} = require('../controllers/medicineController');

// GET /api/medicines/search?q=&lat=&lng=
router.get('/search', searchMedicines);

// GET /api/medicines/list
router.get('/list', getAllMedicines);

// GET /api/medicines/:id/prices?lat=&lng=
router.get('/:id/prices', getMedicinePrices);

module.exports = router;
