const Course = require("../models/Course");
const Chapter = require("../models/Chapter");
const Lesson = require("../models/Lesson");

// --- Helper: Slug Generator ---
// --- Helper: Slug Generator ---
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Split diacritics from letters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

//tạo khóa học
exports.createCourse = async (req, res) => {
  try {
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
    } = req.body;
    //tạo slug và tránh trùng
    let slug = slugify(title);
    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      slug = `${slug}-${Date.now()}`;
    }

    const course = await Course.create({
      title,
      slug,
      description,
      price,
      salePrice,
      level,
      category,
      tags,
      thumbnail,
      instructor: req.user._id,
      isPublished
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
//lấy tất cả khóa học (công khai)
exports.getAllCourses = async (req, res) => {
  try {
    const { level, category, keyword } = req.query;
    const filter = { isPublished: true }; //chỉ công khai
    //lọc theo level, category, keyword
    if (level) filter.level = level;
    if (category) filter.category = category;
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { tags: { $in: [new RegExp(keyword, "i")] } },
      ];
    }

    const courses = await Course.find(filter)
      .populate("instructor", "fullName avatar")
      .select("-description")
      .sort("-createdAt");

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//lấy chi tiết khóa học theo slug (công khai)
exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).populate(
      "instructor",
      "fullName avatar specialization",
    );

    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }
    const chapters = await Chapter.find({ courseId: course._id }).sort("order");
    const courseContent = await Promise.all(
      chapters.map(async (chapter) => {
        const lessons = await Lesson.find({ chapterId: chapter._id }).sort(
          "order",
        );
        return {
          ...chapter.toObject(),
          lessons,
        };
      }),
    );

    res.json({
      ...course.toObject(),
      chapters: courseContent,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//cập nhật khóa học (Admin)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//xóa khóa học (Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    await Chapter.deleteMany({ courseId: course._id });
    await Lesson.deleteMany({ courseId: course._id });

    res.json({ message: "Đã xóa khóa học và toàn bộ nội dung liên quan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. Get My Courses (Purchased - Protected)
// This requires Order model implementation, will leave as placeholder or simple return for now
exports.getMyCourses = async (req, res) => {
    // TODO: Implement logic to fetch courses from user's paid orders
    res.json({ message: "Tính năng này sẽ được cập nhật sau khi có module Orders" });
};
