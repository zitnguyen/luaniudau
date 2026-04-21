const rateLimit = require("express-rate-limit");

const createLimiter = (windowMs, max, message, options = {}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
    message: {
      success: false,
      data: null,
      message,
    },
  });

const isProd = process.env.NODE_ENV === "production";

const signinLimiter = createLimiter(
  60 * 1000,
  isProd ? 5 : 20,
  "Too many authentication attempts. Please try again in a minute.",
  { skipSuccessfulRequests: true },
);

const signupLimiter = createLimiter(
  60 * 1000,
  isProd ? 5 : 15,
  "Too many signup attempts. Please try again in a minute.",
);

const refreshLimiter = createLimiter(
  60 * 1000,
  isProd ? 20 : 120,
  "Too many refresh attempts. Please try again in a minute.",
);

const apiLimiter = createLimiter(
  60 * 1000,
  isProd ? 240 : 5000,
  "Too many requests. Please slow down.",
  {
    // In local development, avoid blocking normal UI polling/refresh traffic.
    skip: (req) =>
      !isProd &&
      (req.ip === "::1" ||
        req.ip === "127.0.0.1" ||
        String(req.headers.origin || "").includes("localhost")),
  },
);

module.exports = {
  signinLimiter,
  signupLimiter,
  refreshLimiter,
  apiLimiter,
};
