export const STUDENT_SKILL_LEVELS = [
  "kid1",
  "kid2",
  "level1",
  "level2",
  "level3",
  "level4",
  "level5",
  "level6",
  "level7",
  "level8",
  "level9",
  "level10",
];

export const getSkillLevelLabel = (level) => {
  if (!level) return "Chưa xếp hạng";
  const normalized = String(level).toLowerCase();
  if (normalized === "kid1") return "Kid 1";
  if (normalized === "kid2") return "Kid 2";
  if (normalized.startsWith("level")) {
    return `Level ${normalized.replace("level", "")}`;
  }
  return level;
};

export const getSkillLevelBadgeClass = (level) => {
  const normalized = String(level || "").toLowerCase();
  if (normalized.startsWith("kid")) return "bg-blue-50 text-blue-700";
  return "bg-purple-50 text-purple-700";
};
