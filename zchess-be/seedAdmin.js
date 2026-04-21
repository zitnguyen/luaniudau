const bcrypt = require("bcryptjs");
const User = require("./models/User");

const DEFAULT_ADMIN = {
  username: "admin",
  email: "admin@gmail.com",
  password: "123456",
  role: "Admin",
  fullName: "Administrator",
};

const seedAdmin = async () => {
  const existing = await User.findOne({
    $or: [{ email: DEFAULT_ADMIN.email }, { username: DEFAULT_ADMIN.username }],
  }).select("_id email username");

  if (existing) {
    console.log("Admin seed skipped: default admin already exists.");
    return existing;
  }

  // Hash explicitly here (do not store plain text password).
  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

  const created = await User.create({
    username: DEFAULT_ADMIN.username,
    email: DEFAULT_ADMIN.email,
    password: hashedPassword,
    role: DEFAULT_ADMIN.role,
    fullName: DEFAULT_ADMIN.fullName,
  });

  console.log("Default admin account created: admin@gmail.com");
  return created;
};

module.exports = seedAdmin;
