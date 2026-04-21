const { body, validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({
    success: false,
    data: null,
    message: "Validation failed",
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
};

const signinValidation = [
  body("username").trim().notEmpty().withMessage("username is required"),
  body("password").isString().notEmpty().withMessage("password is required"),
  handleValidation,
];

const signupValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("username must be 3-50 characters"),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  body("phone")
    .trim()
    .matches(/^0\d{9,10}$/)
    .withMessage("phone must start with 0 and have 10-11 digits"),
  body("email").optional().isEmail().withMessage("email is invalid"),
  handleValidation,
];

module.exports = {
  signinValidation,
  signupValidation,
};
