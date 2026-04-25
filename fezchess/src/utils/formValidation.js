export const validateRequiredFields = (fields = [], values = {}) => {
  const nextErrors = {};
  fields.forEach((field) => {
    if (!field.required) return;
    const raw = values[field.name];
    const isEmpty =
      raw === undefined || raw === null || String(raw).trim() === "";
    if (isEmpty) {
      nextErrors[field.name] = `${field.label} là bắt buộc`;
    }
  });
  return nextErrors;
};
