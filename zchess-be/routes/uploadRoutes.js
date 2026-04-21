const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const logoUploadDir = path.join(__dirname, "..", "uploads", "settings");
if (!fs.existsSync(logoUploadDir)) {
  fs.mkdirSync(logoUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `avatar_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const allowedMimes = new Set(["image/jpeg", "image/jpg", "image/png"]);
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimes.has(file.mimetype)) {
      cb(new Error("Chỉ hỗ trợ file JPG/PNG"));
      return;
    }
    cb(null, true);
  },
});

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, logoUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".png";
    cb(null, `logo_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimes.has(file.mimetype)) {
      cb(new Error("Chỉ hỗ trợ file JPG/PNG"));
      return;
    }
    cb(null, true);
  },
});

router.post(
  "/avatar",
  protect,
  authorize("Admin"),
  (req, res, next) => {
    upload.single("avatar")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "Kích thước ảnh tối đa 2MB" });
        }
        return res
          .status(400)
          .json({ message: err.message || "Upload ảnh thất bại" });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn ảnh" });
    }
    const relativeUrl = `/uploads/avatars/${req.file.filename}`;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    return res.json({ url: `${baseUrl}${relativeUrl}` });
  },
);

router.post(
  "/logo",
  protect,
  authorize("Admin"),
  (req, res, next) => {
    logoUpload.single("logo")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "Kích thước ảnh tối đa 2MB" });
        }
        return res
          .status(400)
          .json({ message: err.message || "Upload logo thất bại" });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn logo" });
    }
    const relativeUrl = `/uploads/settings/${req.file.filename}`;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    return res.json({
      success: true,
      data: { url: `${baseUrl}${relativeUrl}` },
    });
  },
);

module.exports = router;
