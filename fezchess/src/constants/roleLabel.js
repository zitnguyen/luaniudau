export const ROLE_LABEL = {
  admin: "Administrator",
  teacher: "Teacher User",
  student: "Student User",
  parent: "Parent User",
};

export const normalizeRole = (role) => String(role || "").trim().toLowerCase();

export const getRoleLabel = (role) => {
  const normalizedRole = normalizeRole(role);
  return ROLE_LABEL[normalizedRole] || role || "";
};
