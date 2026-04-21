const asyncHandler = require("../middleware/asyncHandler");
const HeroSetting = require("../models/HeroSetting");

const DEFAULT_HERO_PAYLOAD = {
  badgeText: "🏆 Trung tâm Cờ Vua hàng đầu",
  title: "Phát triển tư duy chiến lược cho thế hệ tương lai",
  highlightedText: "tư duy chiến lược",
  description:
    "Z Chess mang đến chương trình đào tạo cờ vua chất lượng cao, giúp trẻ em phát triển tư duy logic, khả năng tập trung và kỹ năng giải quyết vấn đề.",
  primaryButtonText: "Khám phá khóa học",
  primaryButtonLink: "/courses",
  secondaryButtonText: "Xem video giới thiệu",
  secondaryButtonLink: "",
  mediaType: "image",
  mediaUrl:
    "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800&q=80",
  mediaPosterUrl: "",
  floatingCardTitle: "Học thử miễn phí",
  floatingCardSubtitle: "2 buổi đầu tiên",
  ratingValue: "4.9/5",
  ratingText: "200+ đánh giá",
  sectionBgColor: "#F8FAFC",
  titleColor: "#0F172A",
  highlightColor: "#CA8A04",
  descriptionColor: "#64748B",
  badgeBgColor: "rgba(59, 130, 246, 0.2)",
  badgeTextColor: "#2563EB",
  primaryButtonBgColor: "#2563EB",
  primaryButtonTextColor: "#FFFFFF",
  secondaryButtonTextColor: "#0F172A",
  secondaryButtonBorderColor: "rgba(15, 23, 42, 0.2)",
  fontFamily: "inherit",
  stats: [
    { value: "500+", label: "Học viên" },
    { value: "15+", label: "Giáo viên" },
    { value: "50+", label: "Giải thưởng" },
    { value: "10+", label: "Năm kinh nghiệm" },
  ],
};

const getOrCreateHeroSetting = async () => {
  const existing = await HeroSetting.findOne();
  if (existing) return existing;
  return HeroSetting.create(DEFAULT_HERO_PAYLOAD);
};

exports.getPublicHeroSetting = asyncHandler(async (_req, res) => {
  const heroSetting = await getOrCreateHeroSetting();
  res.json(heroSetting);
});

exports.getHeroSetting = asyncHandler(async (_req, res) => {
  const heroSetting = await getOrCreateHeroSetting();
  res.json(heroSetting);
});

exports.updateHeroSetting = asyncHandler(async (req, res) => {
  const heroSetting = await getOrCreateHeroSetting();
  const payload = req.body || {};
  const nextStats = Array.isArray(payload.stats)
    ? payload.stats
        .map((item) => ({
          value: String(item?.value || "").trim(),
          label: String(item?.label || "").trim(),
        }))
        .filter((item) => item.value || item.label)
        .slice(0, 8)
    : undefined;

  Object.assign(heroSetting, payload);
  if (nextStats) heroSetting.stats = nextStats;
  await heroSetting.save();
  res.json(heroSetting);
});
