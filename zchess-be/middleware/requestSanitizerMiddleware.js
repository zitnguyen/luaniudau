const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === "[object Object]";

const sanitizeObject = (input) => {
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item));
  }
  if (!isPlainObject(input)) {
    return input;
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(input)) {
    const safeKey = key.replace(/\$/g, "").replace(/\./g, "");
    sanitized[safeKey] = sanitizeObject(value);
  }
  return sanitized;
};

const requestSanitizer = (req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeObject(req.params);
  }
  next();
};

module.exports = requestSanitizer;
