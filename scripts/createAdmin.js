
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail || !process.env.ADMIN_PASSWORD) {
      throw new Error('Please configure ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    }

    const existingAdmin = await User.findOne({
      email: adminEmail.toLowerCase()
    });

    if (existingAdmin) {
      existingAdmin.role = 'admin';
      await existingAdmin.save();

      console.log('Existing account promoted to admin.');
    } else {
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        12
      );

      await User.create({
        fullName: process.env.ADMIN_NAME || 'CivicTrack Administrator',
        email: adminEmail,
        phone: process.env.ADMIN_PHONE || '9999999999',
        password: hashedPassword,
        address: process.env.ADMIN_ADDRESS || 'CivicTrack Office',
        role: 'admin'
      });

      console.log('Admin account created successfully.');
    }
  } catch (error) {
    console.error('Admin creation failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
