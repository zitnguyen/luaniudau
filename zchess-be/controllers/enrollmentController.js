const Enrollment = require("../models/Enrollment");
const Class = require("../models/Class");
const Student = require("../models/Student");

// 1. Enroll Student (Add student to class)
exports.enrollStudent = async (req, res) => {
  try {
    const { studentId, classId, paymentStatus } = req.body;

    // Check Class
    const classItem = await Class.findById(classId);
    if (!classItem) return res.status(404).json({ message: "Lớp học không tồn tại" });

    // Check Student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Học viên không tồn tại" });

    // Check Duplicate
    const existingEnrollment = await Enrollment.findOne({ studentId, classId });
    if (existingEnrollment) return res.status(400).json({ message: "Học viên đã ghi danh vào lớp này rồi" });

    // Create Enrollment
    const enrollment = await Enrollment.create({
      studentId,
      classId,
      enrollmentDate: new Date(),
      status: "Active", // Default
      paymentStatus: paymentStatus || "Pending",
      sessionsTotal: classItem.totalSessions || 16, // Get from Class or default
      sessionsUsed: 0
    });

    // Update Class currentStudents count
    await Class.findByIdAndUpdate(classId, { $inc: { currentStudents: 1 } });

    res.status(201).json(enrollment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 2. Withdraw Student (Remove from class)
exports.withdrawStudent = async (req, res) => {
    try {
        const { studentId, classId } = req.body;

        const enrollment = await Enrollment.findOneAndDelete({ studentId, classId });
        if (!enrollment) return res.status(404).json({ message: "Ghi danh không tồn tại" });

        // Decrease count
        await Class.findByIdAndUpdate(classId, { $inc: { currentStudents: -1 } });

        res.json({ message: "Đã hủy ghi danh học viên" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. Get Enrollments by Class
exports.getEnrollmentsByClass = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ classId: req.params.classId })
            .populate("studentId", "fullName gender dateOfBirth")
            .sort("-enrollmentDate");
        
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. Get Student's Enrollments
exports.getStudentEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ studentId: req.params.studentId })
            .populate("classId", "className schedule status")
            .sort("-enrollmentDate");

        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
