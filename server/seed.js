/**
 * Seed script — run once to populate test data
 * Usage: node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Pharmacy = require('./models/Pharmacy');
const Medicine = require('./models/Medicine');
const Inventory = require('./models/Inventory');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Pharmacy.deleteMany({});
    await Medicine.deleteMany({});
    await Inventory.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ── Users ──
    const patient = await User.create({
      phone: '9876543210',
      name: 'Rahul Sharma',
      role: 'patient',
    });

    const vendor1 = await User.create({
      phone: '9876543211',
      name: 'HealthPlus Pharmacy',
      role: 'vendor',
    });

    const vendor2 = await User.create({
      phone: '9876543212',
      name: 'MedCorner Store',
      role: 'vendor',
    });

    console.log('👤 Users created');

    // ── Pharmacies ──
    const pharmacy1 = await Pharmacy.create({
      vendorId: vendor1._id,
      name: 'HealthPlus Pharmacy',
      licenseNo: 'PH-2024-001',
      address: '45 Park Street, Kolkata',
      lat: 22.5726,
      lng: 88.3639,
      hours: '8:00 AM - 10:00 PM',
      isVerified: true,
    });

    const pharmacy2 = await Pharmacy.create({
      vendorId: vendor2._id,
      name: 'MedCorner Store',
      licenseNo: 'PH-2024-002',
      address: '12 Salt Lake, Kolkata',
      lat: 22.5804,
      lng: 88.4168,
      hours: '9:00 AM - 9:00 PM',
      isVerified: true,
    });

    console.log('🏪 Pharmacies created');

    // ── Medicines ──
    const med1 = await Medicine.create({
      name: 'Metformin',
      genericName: 'Metformin Hydrochloride',
      salt: 'Metformin HCl',
      manufacturer: 'USV Limited',
      dosage: '500mg',
      packSize: 'Strip of 15',
    });

    const med2 = await Medicine.create({
      name: 'Amlodipine',
      genericName: 'Amlodipine Besylate',
      salt: 'Amlodipine',
      manufacturer: 'Cipla',
      dosage: '5mg',
      packSize: 'Strip of 10',
    });

    const med3 = await Medicine.create({
      name: 'Paracetamol',
      genericName: 'Acetaminophen',
      salt: 'Paracetamol',
      manufacturer: 'GSK',
      dosage: '500mg',
      packSize: 'Strip of 15',
    });

    console.log('💊 Medicines created');

    // ── Inventory ──
    await Inventory.create([
      // Pharmacy 1
      { pharmacyId: pharmacy1._id, medicineId: med1._id, mrp: 145, sellingPrice: 85, stockQty: 120 },
      { pharmacyId: pharmacy1._id, medicineId: med2._id, mrp: 95, sellingPrice: 62, stockQty: 80 },
      { pharmacyId: pharmacy1._id, medicineId: med3._id, mrp: 35, sellingPrice: 22, stockQty: 200 },
      // Pharmacy 2
      { pharmacyId: pharmacy2._id, medicineId: med1._id, mrp: 145, sellingPrice: 92, stockQty: 50 },
      { pharmacyId: pharmacy2._id, medicineId: med2._id, mrp: 95, sellingPrice: 58, stockQty: 30 },
      { pharmacyId: pharmacy2._id, medicineId: med3._id, mrp: 35, sellingPrice: 25, stockQty: 150 },
    ]);

    console.log('📦 Inventory created');
    console.log('\n🎉 Seeding complete!');
    console.log(`   Patient phone: 9876543210`);
    console.log(`   Vendor 1 phone: 9876543211`);
    console.log(`   Vendor 2 phone: 9876543212`);
    console.log(`   OTP for all: 123456`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
