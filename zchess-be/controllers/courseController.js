/**
 * Thin HTTP layer over `services/courseService` (aligned with zlss controllers).
 */
const courseService = require("../services/courseService");
const asyncHandler = require("../middleware/asyncHandler");

exports.createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body, req.user._id);
  res.status(201).json(course);
});

exports.getAllCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getAllCourses(req.query);
  res.json(courses);
});

exports.getCourseBySlug = asyncHandler(async (req, res) => {
  const payload = await courseService.getCourseBySlug(req.params.slug, req.user);
  res.json(payload);
});

exports.getCourseById = asyncHandler(async (req, res) => {
  const payload = await courseService.getCourseById(req.params.id);
  res.json(payload);
});

exports.updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body);
  res.json(course);
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id);
  res.json({ message: "Đã xóa khóa học và toàn bộ nội dung liên quan" });
});

exports.getMyCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getMyCourses(req.user._id);
  res.json({ courses });
});

exports.getCourseAccess = asyncHandler(async (req, res) => {
  const users = await courseService.getCourseAccess(req.params.id);
  res.json({ users });
});

exports.setCourseAccess = asyncHandler(async (req, res) => {
  const userIds = Array.isArray(req.body?.userIds) ? req.body.userIds : [];
  const savedUserIds = await courseService.setCourseAccess(
    req.params.id,
    userIds,
    req.user._id,
  );
  res.json({ userIds: savedUserIds });
});
