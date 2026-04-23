const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  licenseNo: {
    type: String,
  },
  address: {
    type: String,
  },
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
  hours: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Pharmacy', pharmacySchema);
