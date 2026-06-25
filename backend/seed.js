require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); // Make sure this path points to your User model

const seedAdmin = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB...');

    // 2. Check if an admin already exists to prevent duplicates
    const adminExists = await User.findOne({ email: 'admin@platform.com' });
    if (adminExists) {
      console.log('⚠️ Admin already exists in the database.');
      process.exit(0);
    }

    // 3. Create the new Admin user
    // Note: When we call .save(), your User model's pre('save') hook will automatically hash 'admin123'
    const adminUser = new User({
      email: 'admin@platform.com',
      password: '1234',
      role: 'ADMIN',
    });

    await adminUser.save();
    
    console.log('✅ Success! Platform Admin created.');
    console.log('Email: admin@platform.com');
    console.log('Password: 1234');
    
    // 4. Disconnect and exit
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedAdmin();