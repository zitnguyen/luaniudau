import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PlayIcon } from "@heroicons/react/24/solid";
import React from "react";
import { usePublicCms } from "../../context/PublicCmsContext";

// Placeholder image if local asset is missing
const heroImage = "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800&q=80"; // Chess image

const HeroSection = () => {
  const { cms } = usePublicCms();
  const hero = cms?.home?.hero || {};
  const home = cms?.home || {};
  const theme = cms?.theme || {};
  const cleanText = (value, fallback = "") => {
    const normalized = String(value ?? "").trim();
    return normalized || fallback;
  };

  const title = hero?.title || "Phát triển tư duy chiến lược cho thế hệ tương lai";
  const highlightedText = cleanText(hero?.highlightedText, "");
  const primaryButtonText = cleanText(hero?.primaryButtonText, "Khám phá khóa học");
  const secondaryButtonText = cleanText(
    hero?.secondaryButtonText,
    "Xem video giới thiệu",
  );
  const secondaryButtonLink = cleanText(hero?.secondaryButtonLink, "");
  const titleParts = highlightedText && title.includes(highlightedText)
    ? title.split(highlightedText)
    : [title, ""];
  const stats = Array.isArray(hero?.stats) && hero.stats.length > 0
    ? hero.stats
    : [
        { value: "500+", label: "Học viên" },
        { value: "15+", label: "Giáo viên" },
        { value: "50+", label: "Giải thưởng" },
        { value: "10+", label: "Năm kinh nghiệm" },
      ];
  const heroFontFamily = hero?.fontFamily && hero.fontFamily !== "inherit"
    ? hero.fontFamily
    : cms?.home?.fontFamily && cms.home.fontFamily !== "inherit"
      ? cms.home.fontFamily
      : theme?.fontFamily && theme?.fontFamily !== "inherit"
        ? theme.fontFamily
      : undefined;
  const parseHexToRgb = (value) => {
    const hex = String(value || "").trim().replace("#", "");
    if (!hex) return null;
    const normalized =
      hex.length === 3
        ? hex.split("").map((ch) => ch + ch).join("")
        : hex.length === 6
          ? hex
          : null;
    if (!normalized) return null;
    const intVal = Number.parseInt(normalized, 16);
    if (Number.isNaN(intVal)) return null;
    return {
      r: (intVal >> 16) & 255,
      g: (intVal >> 8) & 255,
      b: intVal & 255,
    };
  };
  const getContrastTextColor = (backgroundColor) => {
    const rgb = parseHexToRgb(backgroundColor);
    if (!rgb) return "#ffffff";
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.6 ? "#0f172a" : "#ffffff";
  };
  const secondaryButtonBorderColor =
    hero?.secondaryButtonBorderColor || cms?.home?.buttonColor || undefined;
  const secondaryButtonTextColor =
    hero?.secondaryButtonTextColor ||
    secondaryButtonBorderColor ||
    getContrastTextColor(hero?.sectionBgColor || home?.pageBackgroundColor);

  return (
    <section
      className="relative min-h-[90vh] flex items-center bg-secondary overflow-hidden"
      style={{
        background: hero?.sectionBgColor || home?.pageBackgroundColor || undefined,
        fontFamily: heroFontFamily,
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="chess-pattern w-full h-full" />
      </div>

      {/* Animated Chess Pieces */}
      <motion.div
        className="absolute top-20 right-10 text-8xl opacity-10 select-none"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        ♛
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-10 text-7xl opacity-10 select-none"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        ♞
      </motion.div>
      <motion.div
        className="absolute top-40 left-1/4 text-6xl opacity-5 select-none"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        ♜
      </motion.div>

      <div className="container relative z-10 py-20 mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block text-sm font-medium mb-6">
                <span
                  style={{
                    background: hero?.badgeBgColor || undefined,
                    color: hero?.badgeTextColor || theme?.primaryColor || undefined,
                  }}
                  className="inline-block px-4 py-2 rounded-full"
                >
                  {hero?.badgeText || "🏆 Trung tâm Cờ Vua hàng đầu"}
                </span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-foreground leading-tight mb-6"
              style={{ color: hero?.titleColor || home?.titleColor || undefined }}
            >
              {titleParts[0]}
              {highlightedText ? (
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${hero?.highlightColor || "#CA8A04"}, ${hero?.highlightColor || "#CA8A04"})`,
                  }}
                >
                  {highlightedText}
                </span>
              ) : null}
              {titleParts[1]}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
              style={{ color: hero?.descriptionColor || home?.descriptionColor || undefined }}
            >
              {hero?.description ||
                "Z Chess mang đến chương trình đào tạo cờ vua chất lượng cao, giúp trẻ em phát triển tư duy logic, khả năng tập trung và kỹ năng giải quyết vấn đề."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to={hero?.primaryButtonLink || "/courses"}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-primary text-primary-foreground text-lg px-8 py-4 w-full sm:w-auto rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
                  style={{
                    background:
                      hero?.primaryButtonBgColor || cms?.home?.buttonColor || undefined,
                    color:
                      hero?.primaryButtonTextColor || cms?.home?.buttonTextColor || undefined,
                    borderRadius: theme?.buttonRadius || undefined,
                  }}
                >
                  {primaryButtonText}
                </motion.button>
              </Link>
              {secondaryButtonLink ? (
                <a
                  href={secondaryButtonLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-secondary-foreground/20 text-secondary-foreground rounded-xl font-medium hover:border-primary hover:text-primary transition-colors duration-300"
                    style={{
                      color: secondaryButtonTextColor,
                      borderColor: secondaryButtonBorderColor,
                      borderRadius: theme?.buttonRadius || undefined,
                    }}
                  >
                    <PlayIcon className="w-5 h-5" />
                    {secondaryButtonText}
                  </motion.button>
                </a>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-secondary-foreground/20 text-secondary-foreground rounded-xl font-medium hover:border-primary hover:text-primary transition-colors duration-300"
                  style={{
                    color: secondaryButtonTextColor,
                    borderColor: secondaryButtonBorderColor,
                    borderRadius: theme?.buttonRadius || undefined,
                  }}
                >
                  <PlayIcon className="w-5 h-5" />
                  {secondaryButtonText}
                </motion.button>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary" style={{ color: home?.iconColor || theme?.primaryColor || undefined }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent rounded-3xl" />
                {hero?.mediaType === "video" ? (
                  <video
                    src={hero?.mediaUrl}
                    poster={hero?.mediaPosterUrl || undefined}
                    className="w-full h-full object-cover rounded-3xl shadow-2xl"
                    controls
                  />
                ) : (
                  <img
                    src={hero?.mediaUrl || heroImage}
                    alt="Trẻ em học cờ vua tại Z Chess"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl"
                  />
                )}
              </div>

              {/* Floating Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-2xl">
                    ♔
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {hero?.floatingCardTitle || "Học thử miễn phí"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {hero?.floatingCardSubtitle || "2 buổi đầu tiên"}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Rating Card */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -top-6 -right-6 bg-card p-4 rounded-2xl shadow-xl border border-border"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <div className="font-bold text-foreground">
                      {hero?.ratingValue || "4.9/5"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {hero?.ratingText || "200+ đánh giá"}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
