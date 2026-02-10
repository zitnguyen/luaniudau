const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminEmail = 'admin@chess.com';
    const adminPassword = '123456'; 

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log('Admin account found. Updating password...');
      admin.password = adminPassword; // Pre-save hook will hash this
      await admin.save();
      console.log('Admin password updated successfully.');
    } else {
      console.log('Creating new admin account...');
      admin = await User.create({
        username: 'admin',
        fullName: 'Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'Admin',
        phone: '0987654321'
      });
      console.log('Admin account created successfully.');
    }

    console.log(`\nLogin Credentials:`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
