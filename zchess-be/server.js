/**
 * Process entry: env + Mongo + HTTP listener (mirrors zlss `server.js`).
 * Route/middleware composition lives in `app.js`.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const seedAdmin = require("./seedAdmin");

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
