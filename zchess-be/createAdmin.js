require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/adhs").then(async () => {
  console.log("Connected to MongoDB");

  const existingAdmin = await User.findOne({ username: "admin" });
  if (existingAdmin) {
    console.log("Admin account already exists. Updating password...");
    existingAdmin.password = "123456";
    await existingAdmin.save();
    console.log("Admin account password updated.");
  } else {
    const adminUser = new User({
      username: "admin",
      password: "123456",
      role: "Admin",
      fullName: "System Admin"
    });
    await adminUser.save();
    console.log("Admin account created.");
  }
  process.exit(0);
}).catch(err => {
  console.error("Connection error", err);
  process.exit(1);
});
