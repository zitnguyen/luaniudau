const mongoose = require("mongoose");

const heroSettingSchema = new mongoose.Schema(
  {
    badgeText: { type: String, trim: true, default: "🏆 Trung tâm Cờ Vua hàng đầu" },
    title: {
      type: String,
      trim: true,
      default: "Phát triển tư duy chiến lược cho thế hệ tương lai",
    },
    highlightedText: { type: String, trim: true, default: "tư duy chiến lược" },
    description: {
      type: String,
      trim: true,
      default:
        "Z Chess mang đến chương trình đào tạo cờ vua chất lượng cao, giúp trẻ em phát triển tư duy logic, khả năng tập trung và kỹ năng giải quyết vấn đề.",
    },
    primaryButtonText: { type: String, trim: true, default: "Khám phá khóa học" },
    primaryButtonLink: { type: String, trim: true, default: "/courses" },
    secondaryButtonText: { type: String, trim: true, default: "Xem video giới thiệu" },
    secondaryButtonLink: { type: String, trim: true, default: "" },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    mediaUrl: {
      type: String,
      trim: true,
      default:
        "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800&q=80",
    },
    mediaPosterUrl: { type: String, trim: true, default: "" },
    floatingCardTitle: { type: String, trim: true, default: "Học thử miễn phí" },
    floatingCardSubtitle: { type: String, trim: true, default: "2 buổi đầu tiên" },
    ratingValue: { type: String, trim: true, default: "4.9/5" },
    ratingText: { type: String, trim: true, default: "200+ đánh giá" },
    sectionBgColor: { type: String, trim: true, default: "#F8FAFC" },
    titleColor: { type: String, trim: true, default: "#0F172A" },
    highlightColor: { type: String, trim: true, default: "#CA8A04" },
    descriptionColor: { type: String, trim: true, default: "#64748B" },
    badgeBgColor: { type: String, trim: true, default: "rgba(59, 130, 246, 0.2)" },
    badgeTextColor: { type: String, trim: true, default: "#2563EB" },
    primaryButtonBgColor: { type: String, trim: true, default: "#2563EB" },
    primaryButtonTextColor: { type: String, trim: true, default: "#FFFFFF" },
    secondaryButtonTextColor: { type: String, trim: true, default: "#0F172A" },
    secondaryButtonBorderColor: { type: String, trim: true, default: "rgba(15, 23, 42, 0.2)" },
    fontFamily: { type: String, trim: true, default: "inherit" },
    stats: {
      type: [
        {
          value: { type: String, trim: true },
          label: { type: String, trim: true },
        },
      ],
      default: [
        { value: "500+", label: "Học viên" },
        { value: "15+", label: "Giáo viên" },
        { value: "50+", label: "Giải thưởng" },
        { value: "10+", label: "Năm kinh nghiệm" },
      ],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("HeroSetting", heroSettingSchema);
