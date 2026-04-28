const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');

// Distance formula (Haversine)
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// @desc    Search medicines by name within 5km
// @route   GET /api/medicines/search?q=&lat=&lng=
// @access  Public
const searchMedicines = async (req, res) => {
  try {
    const { q, lat, lng } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query (q) is required' });
    }

    const userLat = parseFloat(lat) || 0;
    const userLng = parseFloat(lng) || 0;

    // Find all listed inventory, populate medicine and pharmacy
    const inventoryItems = await Inventory.find({ isListed: true })
      .populate('medicineId')
      .populate('pharmacyId');

    // Filter by medicine name (case-insensitive regex)
    const regex = new RegExp(q, 'i');
    let results = inventoryItems.filter(
      (item) => item.medicineId && regex.test(item.medicineId.name)
    );

    // Calculate distance and filter within 5km
    results = results
      .map((item) => {
        const pharmacy = item.pharmacyId;
        const distance =
          pharmacy && pharmacy.lat && pharmacy.lng
            ? getDistanceKm(userLat, userLng, pharmacy.lat, pharmacy.lng)
            : 0;

        return {
          inventoryId: item._id,
          medicine: {
            id: item.medicineId._id,
            name: item.medicineId.name,
            genericName: item.medicineId.genericName,
            salt: item.medicineId.salt,
            manufacturer: item.medicineId.manufacturer,
            dosage: item.medicineId.dosage,
            packSize: item.medicineId.packSize,
          },
          pharmacy: {
            id: pharmacy._id,
            name: pharmacy.name,
            address: pharmacy.address,
            hours: pharmacy.hours,
          },
          mrp: item.mrp,
          sellingPrice: item.sellingPrice,
          stockQty: item.stockQty,
          distance: Math.round(distance * 10) / 10,
        };
      })
      .filter((item) => item.distance <= 5)
      .sort((a, b) => a.sellingPrice - b.sellingPrice);

    res.status(200).json({ count: results.length, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pharmacy prices for a specific medicine
// @route   GET /api/medicines/:id/prices?lat=&lng=
// @access  Public
const getMedicinePrices = async (req, res) => {
  try {
    const { id } = req.params;
    const userLat = parseFloat(req.query.lat) || 0;
    const userLng = parseFloat(req.query.lng) || 0;

    const inventoryItems = await Inventory.find({
      medicineId: id,
      isListed: true,
    }).populate('pharmacyId').populate('medicineId');

    const results = inventoryItems
      .map((item) => {
        const pharmacy = item.pharmacyId;
        const distance =
          pharmacy && pharmacy.lat && pharmacy.lng
            ? getDistanceKm(userLat, userLng, pharmacy.lat, pharmacy.lng)
            : 0;

        return {
          inventoryId: item._id,
          medicine: item.medicineId ? {
            id: item.medicineId._id,
            name: item.medicineId.name,
            genericName: item.medicineId.genericName,
            salt: item.medicineId.salt,
            manufacturer: item.medicineId.manufacturer,
            dosage: item.medicineId.dosage,
            packSize: item.medicineId.packSize,
          } : null,
          pharmacy: {
            id: pharmacy._id,
            name: pharmacy.name,
            address: pharmacy.address,
            hours: pharmacy.hours,
          },
          mrp: item.mrp,
          sellingPrice: item.sellingPrice,
          stockQty: item.stockQty,
          distance: Math.round(distance * 10) / 10,
        };
      })
      .sort((a, b) => a.sellingPrice - b.sellingPrice);

    res.status(200).json({ count: results.length, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllMedicines = async (req, res) => {
  try {
    const query = req.query.q ? { name: new RegExp(req.query.q, 'i') } : {};
    const medicines = await Medicine.find(query).limit(100);
    res.status(200).json({ medicines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchMedicines, getMedicinePrices, getAllMedicines };
