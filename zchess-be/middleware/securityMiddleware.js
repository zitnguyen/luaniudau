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
  120,
  "Too many requests. Please slow down.",
);

module.exports = {
  signinLimiter,
  signupLimiter,
  refreshLimiter,
  apiLimiter,
};
