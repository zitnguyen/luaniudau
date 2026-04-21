/**
 * Operational errors (aligned with zlss): thrown from handlers/services and
 * normalized by `middleware/errorMiddleware.js` into consistent JSON responses.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
