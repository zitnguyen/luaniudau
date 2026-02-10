//tạo học viên mới(Admin, Teacher)
const Student = require("../models/Student");
const User = require("../models/User");

// Tạo học viên mới (Admin, Teacher)
exports.createStudent = async (req, res) => {
  try {
    const { parentPhone, ...studentData } = req.body;

    if (!parentPhone) {
      return res.status(400).json({ message: "Thiếu số điện thoại phụ huynh" });
    }

    // 1. Tìm phụ huynh theo SĐT
    const parent = await User.findOne({
      phone: parentPhone,
      role: "Parent",
    });

    if (!parent) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy phụ huynh với số điện thoại này" });
    }

    // 2. Tạo học viên
    const student = await Student.create({
      ...studentData,
      parentId: parent._id,
    });

    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//lấy tất cả học viên (Admin)
exports.getAllStudents = async (req, res) => {
  try {
    const { parentId, keyword } = req.query;
    const filter = {};

    if (parentId) filter.parentId = parentId;
    if (keyword) {
      filter.fullName = { $regex: keyword, $options: "i" };
    }

    const students = await Student.find(filter)
      .populate("parentId", "fullName email phone")
      .sort("-createdAt");

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//lấy học viên theo id (Admin, Teacher, Parent)
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "parentId",
      "fullName email phone",
    );

    if (!student) {
      return res.status(404).json({ message: "Học viên không tồn tại" });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Update Student
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ message: "Học viên không tồn tại" });
    }

    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 5. Delete Student (Admin)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Học viên không tồn tại" });
    }

    // Check Enrollments/Attendance before delete?

    res.json({ message: "Đã xóa hồ sơ học viên" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. Get My Children (Parent)
exports.getMyChildren = async (req, res) => {
  try {
    const students = await Student.find({ parentId: req.user._id });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
