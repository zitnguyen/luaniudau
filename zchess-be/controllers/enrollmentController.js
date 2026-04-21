const Enrollment = require("../models/Enrollment");
const Class = require("../models/Class");
const Student = require("../models/Student");
const asyncHandler = require("../middleware/asyncHandler");

const normalizePaymentStatus = (raw) => {
  const v = (raw || "unpaid").toString().toLowerCase();
  if (v === "pending" || v === "overdue") return "unpaid";
  if (["unpaid", "paid", "partial"].includes(v)) return v;
  return "unpaid";
};

const normalizeEnrollmentStatus = (raw) => {
  const v = (raw || "Active").toString();
  const lower = v.toLowerCase();
  const map = {
    active: "Active",
    completed: "Completed",
    dropped: "Dropped",
    reserved: "Reserved",
  };
  return map[lower] || (["Active", "Completed", "Dropped", "Reserved"].includes(v) ? v : "Active");
};

const populateEnrollment = (q) =>
  q
    .populate("studentId", "fullName dateOfBirth studentId parentId")
    .populate("classId", "className schedule status fee maxStudents");

const ensureTeacherOwnsEnrollment = async (enrollmentId, teacherId) => {
  const enrollment = await Enrollment.findById(enrollmentId).select("classId");
  if (!enrollment) return { exists: false, allowed: false };
  const ownClass = await Class.exists({
    _id: enrollment.classId,
    teacherId,
  });
  return { exists: true, allowed: Boolean(ownClass) };
};

exports.listEnrollments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.classId) filter.classId = req.query.classId;
  if (req.query.studentId) filter.studentId = req.query.studentId;

  if (req.user?.role === "Teacher") {
    if (filter.classId) {
      const ownClass = await Class.exists({
        _id: filter.classId,
        teacherId: req.user._id,
      });
      if (!ownClass) {
        return res.status(403).json({ message: "Forbidden" });
      }
    } else {
      const classDocs = await Class.find({ teacherId: req.user._id }).select("_id");
      filter.classId = { $in: classDocs.map((c) => c._id) };
    }
  }

  const enrollments = await populateEnrollment(
    Enrollment.find(filter).sort("-enrollmentDate"),
  );
  res.json(enrollments);
});

exports.getEnrollmentById = asyncHandler(async (req, res) => {
  if (req.user?.role === "Teacher") {
    const check = await ensureTeacherOwnsEnrollment(req.params.id, req.user._id);
    if (!check.exists) {
      return res.status(404).json({ message: "Không tìm thấy ghi danh" });
    }
    if (!check.allowed) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  const enrollment = await populateEnrollment(
    Enrollment.findById(req.params.id),
  );
  if (!enrollment) {
    return res.status(404).json({ message: "Không tìm thấy ghi danh" });
  }
  res.json(enrollment);
});

exports.updateEnrollment = asyncHandler(async (req, res) => {
  if (req.user?.role === "Teacher") {
    const check = await ensureTeacherOwnsEnrollment(req.params.id, req.user._id);
    if (!check.exists) {
      return res.status(404).json({ message: "Không tìm thấy ghi danh" });
    }
    if (!check.allowed) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  const patch = {};
  if (req.body.paymentStatus !== undefined) {
    patch.paymentStatus = normalizePaymentStatus(req.body.paymentStatus);
  }
  if (req.body.status !== undefined) {
    patch.status = normalizeEnrollmentStatus(req.body.status);
  }
  if (req.body.feeAmount !== undefined) {
    patch.feeAmount = Number(req.body.feeAmount);
  }
  if (req.body.sessionsTotal !== undefined) {
    patch.sessionsTotal = Number(req.body.sessionsTotal);
  }
  if (req.body.sessionsUsed !== undefined) {
    patch.sessionsUsed = Number(req.body.sessionsUsed);
  }
  if (req.body.enrollmentDate !== undefined && req.body.enrollmentDate !== "") {
    patch.enrollmentDate = new Date(req.body.enrollmentDate);
  }

  const enrollment = await populateEnrollment(
    Enrollment.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    }),
  );

  if (!enrollment) {
    return res.status(404).json({ message: "Không tìm thấy ghi danh" });
  }
  res.json(enrollment);
});

exports.deleteEnrollment = asyncHandler(async (req, res) => {
  if (req.user?.role === "Teacher") {
    const check = await ensureTeacherOwnsEnrollment(req.params.id, req.user._id);
    if (!check.exists) {
      return res.status(404).json({ message: "Không tìm thấy ghi danh" });
    }
    if (!check.allowed) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    return res.status(404).json({ message: "Không tìm thấy ghi danh" });
  }

  await Enrollment.findByIdAndDelete(req.params.id);
  await Class.findByIdAndUpdate(enrollment.classId, { $inc: { currentStudents: -1 } });

  res.json({ message: "Đã xóa ghi danh" });
});

exports.enrollStudent = asyncHandler(async (req, res) => {
  const { studentId, classId, paymentStatus, feeAmount, enrollmentDate, status } =
    req.body;

  const classItem = await Class.findById(classId);
  if (!classItem)
    return res.status(404).json({ message: "Lớp học không tồn tại" });

  const student = await Student.findById(studentId).select("isDeleted");
  if (!student)
    return res.status(404).json({ message: "Học viên không tồn tại" });
  if (student.isDeleted) {
    return res
      .status(400)
      .json({ message: "Không thể ghi danh cho học viên đã bị xóa" });
  }

  const existingEnrollment = await Enrollment.findOne({ studentId, classId });
  if (existingEnrollment)
    return res.status(400).json({ message: "Học viên đã ghi danh vào lớp này rồi" });

  const resolvedFee =
    feeAmount != null && feeAmount !== ""
      ? Number(feeAmount)
      : classItem.fee != null
        ? Number(classItem.fee)
        : 0;

  const enrollment = await Enrollment.create({
    studentId,
    classId,
    enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
    status: normalizeEnrollmentStatus(status),
    paymentStatus: normalizePaymentStatus(paymentStatus),
    feeAmount: resolvedFee,
    sessionsTotal: classItem.totalSessions || 16,
    sessionsUsed: 0,
  });

  await Class.findByIdAndUpdate(classId, { $inc: { currentStudents: 1 } });

  res.status(201).json(enrollment);
});

exports.withdrawStudent = asyncHandler(async (req, res) => {
  const { studentId, classId } = req.body;

  const enrollment = await Enrollment.findOneAndDelete({ studentId, classId });
  if (!enrollment)
    return res.status(404).json({ message: "Ghi danh không tồn tại" });

  await Class.findByIdAndUpdate(classId, { $inc: { currentStudents: -1 } });

  res.json({ message: "Đã hủy ghi danh học viên" });
});

exports.getEnrollmentsByClass = asyncHandler(async (req, res) => {
  if (req.user?.role === "Teacher") {
    const ownClass = await Class.exists({
      _id: req.params.classId,
      teacherId: req.user._id,
    });
    if (!ownClass) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const enrollments = await populateEnrollment(
    Enrollment.find({ classId: req.params.classId }).sort("-enrollmentDate"),
  );

  res.json(enrollments);
});

exports.getStudentEnrollments = asyncHandler(async (req, res) => {
  if (req.user && req.user.role === "Parent") {
    const owns = await Student.exists({
      _id: req.params.studentId,
      parentId: req.user._id,
    });
    if (!owns) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  if (req.user && req.user.role === "Teacher") {
    const classIds = await Class.find({ teacherId: req.user._id }).distinct("_id");
    const ownsStudentEnrollment = await Enrollment.exists({
      studentId: req.params.studentId,
      classId: { $in: classIds },
    });
    if (!ownsStudentEnrollment) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const enrollments = await populateEnrollment(
    Enrollment.find({
      studentId: req.params.studentId,
    }).sort("-enrollmentDate"),
  );

  res.json(enrollments);
});
