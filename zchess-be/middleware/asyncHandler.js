/**
 * Wraps async route handlers so rejected Promises reach Express error middleware
 * (same pattern as zlss).
 */
module.exports = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
