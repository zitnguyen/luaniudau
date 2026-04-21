const asyncHandler = require("../middleware/asyncHandler");
const Setting = require("../models/Setting");
const HeroSetting = require("../models/HeroSetting");

const DEFAULT_SETTINGS = {
  singletonKey: "system",
  logoUrl: "",
  centerName: "Z Chess",
  address: "",
  hotline: "",
  email: "",
  workingHours: "",
  bankName: "Techcombank",
  bankAccountNumber: "",
  bankAccountName: "",
  paymentQrUrl: "",
  paymentTransferPrefix: "KHOAHOC",
  publicCms: {
    theme: {
      fontFamily: "inherit",
      primaryColor: "#2563EB",
      secondaryColor: "#0F172A",
      accentColor: "#CA8A04",
      textColor: "#0F172A",
      mutedTextColor: "#64748B",
      buttonRadius: "12px",
    },
    home: {
      hero: {},
      courses: {},
      teachers: {},
      news: {},
      testimonials: {},
      contact: {},
      cta: {},
    },
    courseStore: {},
    courseDetail: {},
    teachersPage: {},
    newsPage: {},
    contactPage: {},
  },
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
    "bankName",
    "bankAccountNumber",
    "bankAccountName",
    "paymentQrUrl",
    "paymentTransferPrefix",
  ];

  fields.forEach((field) => {
    if (body[field] !== undefined) {
      patch[field] = String(body[field] ?? "").trim();
    }
  });
  if (body.publicCms && typeof body.publicCms === "object") {
    patch.publicCms = body.publicCms;
  }
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

const mapLegacyHeroToCms = (hero) => {
  if (!hero) return null;
  return {
    ...DEFAULT_SETTINGS.publicCms,
    home: {
      ...DEFAULT_SETTINGS.publicCms.home,
      hero: {
        badgeText: hero.badgeText || "🏆 Trung tâm Cờ Vua hàng đầu",
        title:
          hero.title || "Phát triển tư duy chiến lược cho thế hệ tương lai",
        highlightedText: hero.highlightedText || "tư duy chiến lược",
        description:
          hero.description ||
          "Z Chess mang đến chương trình đào tạo cờ vua chất lượng cao, giúp trẻ em phát triển tư duy logic, khả năng tập trung và kỹ năng giải quyết vấn đề.",
        primaryButtonText: hero.primaryButtonText || "Khám phá khóa học",
        primaryButtonLink: hero.primaryButtonLink || "/courses",
        secondaryButtonText: hero.secondaryButtonText || "Xem video giới thiệu",
        secondaryButtonLink: hero.secondaryButtonLink || "",
        mediaType: hero.mediaType || "image",
        mediaUrl: hero.mediaUrl || "",
        mediaPosterUrl: hero.mediaPosterUrl || "",
        floatingCardTitle: hero.floatingCardTitle || "Học thử miễn phí",
        floatingCardSubtitle: hero.floatingCardSubtitle || "2 buổi đầu tiên",
        ratingValue: hero.ratingValue || "4.9/5",
        ratingText: hero.ratingText || "200+ đánh giá",
        stats: Array.isArray(hero.stats) ? hero.stats : [],
        sectionBgColor: hero.sectionBgColor || "#F8FAFC",
        titleColor: hero.titleColor || "#0F172A",
        highlightColor: hero.highlightColor || "#CA8A04",
        descriptionColor: hero.descriptionColor || "#64748B",
        badgeBgColor: hero.badgeBgColor || "#BFDBFE",
        badgeTextColor: hero.badgeTextColor || "#2563EB",
        primaryButtonBgColor: hero.primaryButtonBgColor || "#2563EB",
        primaryButtonTextColor: hero.primaryButtonTextColor || "#FFFFFF",
        secondaryButtonTextColor: hero.secondaryButtonTextColor || "#0F172A",
        secondaryButtonBorderColor: hero.secondaryButtonBorderColor || "#CBD5E1",
        fontFamily: hero.fontFamily || "inherit",
      },
    },
  };
};

const ensurePublicCms = async (settingsDoc) => {
  if (settingsDoc.publicCms) return settingsDoc.publicCms;
  const heroDoc = await HeroSetting.findOne();
  const mapped = mapLegacyHeroToCms(heroDoc);
  settingsDoc.publicCms = mapped || DEFAULT_SETTINGS.publicCms;
  await settingsDoc.save();
  return settingsDoc.publicCms;
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

exports.getPublicCms = asyncHandler(async (_req, res) => {
  const settings = await ensureSingletonSettings();
  const publicCms = await ensurePublicCms(settings);
  res.json({
    success: true,
    data: publicCms,
  });
});

exports.getAdminPublicCms = asyncHandler(async (_req, res) => {
  const settings = await ensureSingletonSettings();
  const publicCms = await ensurePublicCms(settings);
  res.json({
    success: true,
    data: publicCms,
  });
});

exports.updatePublicCms = asyncHandler(async (req, res) => {
  const settings = await ensureSingletonSettings();
  const previous = (await ensurePublicCms(settings)) || {};
  const incoming = req.body?.publicCms;
  if (!incoming || typeof incoming !== "object") {
    return res.status(400).json({
      success: false,
      message: "publicCms payload is required",
    });
  }
  settings.publicCms = {
    ...previous,
    ...incoming,
    theme: { ...(previous.theme || {}), ...(incoming.theme || {}) },
    home: { ...(previous.home || {}), ...(incoming.home || {}) },
    courseStore: { ...(previous.courseStore || {}), ...(incoming.courseStore || {}) },
    courseDetail: { ...(previous.courseDetail || {}), ...(incoming.courseDetail || {}) },
    teachersPage: { ...(previous.teachersPage || {}), ...(incoming.teachersPage || {}) },
    newsPage: { ...(previous.newsPage || {}), ...(incoming.newsPage || {}) },
    contactPage: { ...(previous.contactPage || {}), ...(incoming.contactPage || {}) },
  };
  if (incoming.home) {
    settings.publicCms.home = {
      ...(previous.home || {}),
      ...(incoming.home || {}),
      hero: { ...(previous.home?.hero || {}), ...(incoming.home?.hero || {}) },
      courses: { ...(previous.home?.courses || {}), ...(incoming.home?.courses || {}) },
      teachers: { ...(previous.home?.teachers || {}), ...(incoming.home?.teachers || {}) },
      news: { ...(previous.home?.news || {}), ...(incoming.home?.news || {}) },
      testimonials: {
        ...(previous.home?.testimonials || {}),
        ...(incoming.home?.testimonials || {}),
      },
      contact: { ...(previous.home?.contact || {}), ...(incoming.home?.contact || {}) },
      cta: { ...(previous.home?.cta || {}), ...(incoming.home?.cta || {}) },
    };
  }
  await settings.save();
  res.json({
    success: true,
    message: "Cập nhật Public CMS thành công",
    data: settings.publicCms,
  });
});
