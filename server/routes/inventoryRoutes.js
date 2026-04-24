const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  getInventory,
  addInventory,
  updateInventory,
  deleteInventory,
} = require('../controllers/inventoryController');

// All routes require: logged in + vendor role
router.use(protect, requireRole('vendor'));

// GET    /api/vendor/inventory       → list vendor's inventory
router.get('/', getInventory);

// POST   /api/vendor/inventory       → add item
router.post('/', addInventory);

// PATCH  /api/vendor/inventory/:id   → update price/stock
router.patch('/:id', updateInventory);

// DELETE /api/vendor/inventory/:id   → soft delete (unlist)
router.delete('/:id', deleteInventory);

module.exports = router;
