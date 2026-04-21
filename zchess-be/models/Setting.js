const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: "system",
      unique: true,
      immutable: true,
    },
    logoUrl: { type: String, trim: true, default: "" },
    centerName: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    hotline: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    workingHours: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Setting", settingSchema);
