/**
 * Course domain logic extracted from the controller (zlss-style: fat service,
 * thin controller). Keeps response shapes compatible with existing API consumers.
 */
const Course = require("../models/Course");
const Chapter = require("../models/Chapter");
const Lesson = require("../models/Lesson");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");
const mongoose = require("mongoose");

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

exports.createCourse = async (data, userId) => {
  const {
    title,
    description,
    price,
    salePrice,
    level,
    category,
    tags,
    thumbnail,
    isPublished,
  } = data;

  let slug = slugify(title);
  const existingCourse = await Course.findOne({ slug });
  if (existingCourse) {
    slug = `${slug}-${Date.now()}`;
  }

  return Course.create({
    title,
    slug,
    description,
    price,
    salePrice,
    level,
    category,
    tags,
    thumbnail,
    instructor: userId,
    isPublished,
  });
};

exports.getAllCourses = async (query) => {
  const { level, category, keyword, admin } = query;
  const filter = {};
  if (admin !== "true") {
    filter.isPublished = true;
  }

  if (level) filter.level = level;
  if (category) filter.category = category;
  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { tags: { $in: [new RegExp(keyword, "i")] } },
    ];
  }

  return Course.find(filter)
    .populate("instructor", "fullName avatar")
    .select("-description")
    .sort("-createdAt");
};

exports.getCourseBySlug = async (slug) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(slug));
  const course = await (isObjectId
    ? Course.findById(slug)
    : Course.findOne({ slug })).populate(
    "instructor",
    "fullName avatar specialization",
  );

  if (!course) {
    throw new AppError("Không tìm thấy khóa học", 404);
  }

  const chapters = await Chapter.find({ courseId: course._id }).sort("order");
  const courseContent = await Promise.all(
    chapters.map(async (chapter) => {
      const lessons = await Lesson.find({ chapterId: chapter._id }).sort("order");
      return {
        ...chapter.toObject(),
        lessons,
      };
    }),
  );

  return {
    ...course.toObject(),
    chapters: courseContent,
  };
};

exports.getCourseById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("ID khóa học không hợp lệ", 400);
  }

  const course = await Course.findById(id).populate(
    "instructor",
    "fullName avatar specialization",
  );

  if (!course) {
    throw new AppError("Không tìm thấy khóa học", 404);
  }

  const chapters = await Chapter.find({ courseId: course._id }).sort("order");
  const courseContent = await Promise.all(
    chapters.map(async (chapter) => {
      const lessons = await Lesson.find({ chapterId: chapter._id }).sort("order");
      return {
        ...chapter.toObject(),
        lessons,
      };
    }),
  );

  return {
    ...course.toObject(),
    chapters: courseContent,
  };
};

exports.updateCourse = async (id, body) => {
  const course = await Course.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    throw new AppError("Không tìm thấy khóa học", 404);
  }

  return course;
};

exports.deleteCourse = async (id) => {
  const course = await Course.findByIdAndDelete(id);
  if (!course) {
    throw new AppError("Không tìm thấy khóa học", 404);
  }

  await Chapter.deleteMany({ courseId: course._id });
  await Lesson.deleteMany({ courseId: course._id });

  return course;
};

/**
 * Courses the user has purchased (completed orders), inspired by zlss order flow.
 */
exports.getMyCourses = async (userId) => {
  const orders = await Order.find({
    userId,
    status: "completed",
  }).populate("items.courseId");

  const courses = [];
  const seen = new Set();

  for (const order of orders) {
    for (const item of order.items || []) {
      const c = item.courseId;
      if (c && c._id && !seen.has(String(c._id))) {
        seen.add(String(c._id));
        courses.push(c);
      }
    }
  }

  return courses;
};
