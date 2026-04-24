const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');

// @desc    Get vendor's inventory
// @route   GET /api/vendor/inventory
// @access  Private (vendor)
const getInventory = async (req, res) => {
  try {
    // Find pharmacy owned by this vendor
    const pharmacy = await Pharmacy.findOne({ vendorId: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found. Please register your pharmacy first.' });
    }

    const inventory = await Inventory.find({ pharmacyId: pharmacy._id })
      .populate('medicineId');

    res.status(200).json({ count: inventory.length, inventory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to inventory
// @route   POST /api/vendor/inventory
// @access  Private (vendor)
const addInventory = async (req, res) => {
  try {
    const { medicineId, mrp, sellingPrice, stockQty } = req.body;

    // Find pharmacy owned by this vendor
    const pharmacy = await Pharmacy.findOne({ vendorId: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found. Please register your pharmacy first.' });
    }

    const item = await Inventory.create({
      pharmacyId: pharmacy._id,
      medicineId,
      mrp,
      sellingPrice,
      stockQty,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inventory item (price / stock)
// @route   PATCH /api/vendor/inventory/:id
// @access  Private (vendor)
const updateInventory = async (req, res) => {
  try {
    const { sellingPrice, stockQty } = req.body;

    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (sellingPrice !== undefined) item.sellingPrice = sellingPrice;
    if (stockQty !== undefined) item.stockQty = stockQty;
    item.updatedAt = Date.now();

    await item.save();

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Soft delete inventory item
// @route   DELETE /api/vendor/inventory/:id
// @access  Private (vendor)
const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    item.isListed = false;
    item.updatedAt = Date.now();
    await item.save();

    res.status(200).json({ message: 'Item unlisted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInventory, addInventory, updateInventory, deleteInventory };
