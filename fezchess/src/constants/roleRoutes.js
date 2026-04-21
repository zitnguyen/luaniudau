export const getDashboardPathByRole = (role) => {
  const normalized = String(role || "").trim().toLowerCase();
  if (normalized === "admin") return "/dashboard";
  if (normalized === "teacher") return "/teacher/dashboard";
  if (normalized === "parent") return "/parent/schedule";
  if (normalized === "student") return "/student/dashboard";
  return "/";
};
