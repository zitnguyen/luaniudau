const asyncHandler = require("../middleware/asyncHandler");
const Setting = require("../models/Setting");

const DEFAULT_SETTINGS = {
  singletonKey: "system",
  logoUrl: "",
  centerName: "Z Chess",
  address: "",
  hotline: "",
  email: "",
  workingHours: "",
};

const sanitizePatch = (body = {}) => {
  const patch = {};
  const fields = [
    "logoUrl",
    "centerName",
    "address",
    "hotline",
    "email",
    "workingHours",
  ];

  fields.forEach((field) => {
    if (body[field] !== undefined) {
      patch[field] = String(body[field] ?? "").trim();
    }
  });
  return patch;
};

const ensureSingletonSettings = async () => {
  const settings = await Setting.findOneAndUpdate(
    { singletonKey: "system" },
    { $setOnInsert: DEFAULT_SETTINGS },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return settings;
};

exports.getSettings = asyncHandler(async (_req, res) => {
  const settings = await ensureSingletonSettings();
  res.json({
    success: true,
    data: settings,
  });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const patch = sanitizePatch(req.body);
  const settings = await Setting.findOneAndUpdate(
    { singletonKey: "system" },
    { $set: patch, $setOnInsert: { singletonKey: "system" } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  res.json({
    success: true,
    message: "Cập nhật cấu hình hệ thống thành công",
    data: settings,
  });
});
