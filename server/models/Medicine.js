const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  genericName: {
    type: String,
  },
  salt: {
    type: String,
  },
  manufacturer: {
    type: String,
  },
  dosage: {
    type: String,
  },
  packSize: {
    type: String,
  },
});

module.exports = mongoose.model('Medicine', medicineSchema);
