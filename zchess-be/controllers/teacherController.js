const asyncHandler = require("../middleware/asyncHandler");
const Class = require("../models/Class");
const Enrollment = require("../models/Enrollment");
const Attendance = require("../models/Attendance");
const TeachingLog = require("../models/TeachingLog");
const Progress = require("../models/Progress");
const User = require("../models/User");

const getTeacherClassIds = async (teacherId) => {
  const classes = await Class.find({ teacherId }).select("_id");
  return classes.map((item) => item._id);
};

const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

exports.getTeacherDashboard = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;
  const classIds = await getTeacherClassIds(teacherId);

  const classes = await Class.find({ _id: { $in: classIds } })
    .sort({ createdAt: -1 })
    .lean();

  const [enrollments, attendanceRecords, teachingLogs] = await Promise.all([
    Enrollment.find({ classId: { $in: classIds } })
      .populate("studentId", "fullName studentId skillLevel")
      .populate("classId", "className")
      .lean(),
    Attendance.find({ classId: { $in: classIds } })
      .sort({ date: -1 })
      .limit(50)
      .populate("studentId", "fullName studentId")
      .populate("classId", "className")
      .lean(),
    TeachingLog.find({ teacherId })
      .sort({ date: -1 })
      .populate("classId", "className")
      .lean(),
  ]);

  const classStatsMap = new Map();
  classes.forEach((item) => classStatsMap.set(String(item._id), []));
  enrollments.forEach((enr) => {
    const key = String(enr.classId?._id || enr.classId);
    if (!classStatsMap.has(key)) classStatsMap.set(key, []);
    classStatsMap.get(key).push(enr);
  });

  const classesWithStudents = classes.map((item) => {
    const classEnrollments = classStatsMap.get(String(item._id)) || [];
    return {
      _id: item._id,
      className: item.className,
      schedule: item.schedule || "",
      currentStudents: item.currentStudents || classEnrollments.length || 0,
      status: item.status,
      students: classEnrollments.map((enr) => ({
        _id: enr.studentId?._id || enr.studentId,
        fullName: enr.studentId?.fullName || "N/A",
        studentId: enr.studentId?.studentId || "",
        skillLevel: enr.studentId?.skillLevel,
      })),
    };
  });

  const { start, end } = getDayRange(new Date());
  const todaySchedule = classesWithStudents.filter((item) => {
    const scheduleValue = String(item.schedule || "").toUpperCase();
    const dayMap = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return scheduleValue.includes(dayMap[new Date().getDay()]);
  });

  const latestAttendance = attendanceRecords.slice(0, 8);
  const latestTeachingLogs = teachingLogs.slice(0, 8);
  const todayTeachingLogs = teachingLogs.filter((log) => {
    const d = new Date(log.date);
    return d >= start && d <= end;
  });

  const totalClasses = classesWithStudents.length;
  const totalStudents = classesWithStudents.reduce(
    (sum, item) => sum + (item.currentStudents || 0),
    0,
  );

  res.json({
    stats: {
      totalClasses,
      totalStudents,
      todaySchedulesCount: todaySchedule.length,
      latestAttendanceCount: latestAttendance.length,
      totalTeachingSessions: teachingLogs.length,
      todayTeachingSessions: todayTeachingLogs.length,
    },
    classes: classesWithStudents,
    todaySchedule,
    latestAttendance,
    latestTeachingLogs,
  });
});

exports.getTeacherClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find({ teacherId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  const classIds = classes.map((item) => item._id);
  const enrollments = await Enrollment.find({ classId: { $in: classIds } })
    .populate("studentId", "fullName studentId skillLevel")
    .lean();

  const byClass = new Map();
  enrollments.forEach((enr) => {
    const key = String(enr.classId);
    if (!byClass.has(key)) byClass.set(key, []);
    byClass.get(key).push(enr.studentId);
  });

  const mapped = classes.map((item) => {
    const students = byClass.get(String(item._id)) || [];
    return {
      ...item,
      students: students.filter(Boolean),
      currentStudents: item.currentStudents || students.length || 0,
    };
  });

  res.json(mapped);
});

exports.getTeacherStudents = asyncHandler(async (req, res) => {
  const classIds = await getTeacherClassIds(req.user._id);
  const enrollments = await Enrollment.find({ classId: { $in: classIds } })
    .populate("studentId", "fullName studentId skillLevel")
    .populate("classId", "className")
    .lean();

  const students = enrollments
    .filter((enr) => enr.studentId)
    .map((enr) => ({
      _id: enr.studentId._id,
      fullName: enr.studentId.fullName,
      studentId: enr.studentId.studentId,
      skillLevel: enr.studentId.skillLevel,
      className: enr.classId?.className || "",
      classId: enr.classId?._id || enr.classId,
    }));

  res.json(students);
});

exports.getTeacherAttendance = asyncHandler(async (req, res) => {
  const classIds = await getTeacherClassIds(req.user._id);
  const records = await Attendance.find({ classId: { $in: classIds } })
    .sort({ date: -1 })
    .limit(50)
    .populate("studentId", "fullName studentId")
    .populate("classId", "className")
    .lean();

  res.json(records);
});

exports.getTeacherFinance = asyncHandler(async (req, res) => {
  const logs = await TeachingLog.find({ teacherId: req.user._id })
    .sort({ date: -1 })
    .populate("classId", "className")
    .lean();

  const totalHours = logs.reduce(
    (sum, log) => sum + (log.durationHours || 0),
    0,
  );
  const paidSessions = logs.filter((log) => log.status === "Paid").length;
  const confirmedSessions = logs.filter(
    (log) => log.status === "Confirmed",
  ).length;

  res.json({
    totalSessions: logs.length,
    totalHours,
    paidSessions,
    confirmedSessions,
    logs: logs.slice(0, 20),
  });
});

const ensureTeacherCanAccessStudentInClass = async ({
  teacherId,
  classId,
  studentId,
}) => {
  const ownClass = await Class.exists({ _id: classId, teacherId });
  if (!ownClass) return false;

  const enrolled = await Enrollment.exists({ classId, studentId });
  return Boolean(enrolled);
};

exports.createTeacherAssessment = asyncHandler(async (req, res) => {
  const { studentId, classId, sessions, teacherFeedback } = req.body;
  if (!studentId || !classId) {
    return res.status(400).json({ message: "Thiếu studentId hoặc classId" });
  }

  const allowed = await ensureTeacherCanAccessStudentInClass({
    teacherId: req.user._id,
    classId,
    studentId,
  });
  if (!allowed) {
    return res.status(403).json({ message: "Forbidden" });
  }

  let progress = await Progress.findOne({ studentId, classId });
  if (progress) {
    progress.sessions = Array.isArray(sessions) ? sessions : progress.sessions;
    progress.teacherFeedback =
      teacherFeedback || progress.teacherFeedback || {};
    progress.teacherId = req.user._id;
    progress.updatedAt = Date.now();
    await progress.save();
  } else {
    progress = await Progress.create({
      studentId,
      classId,
      teacherId: req.user._id,
      sessions: Array.isArray(sessions) ? sessions : [],
      teacherFeedback: teacherFeedback || {},
    });
  }

  res.json(progress);
});

exports.updateTeacherAssessment = asyncHandler(async (req, res) => {
  const progress = await Progress.findById(req.params.id);
  if (!progress) {
    return res.status(404).json({ message: "Không tìm thấy assessment" });
  }

  const allowed = await ensureTeacherCanAccessStudentInClass({
    teacherId: req.user._id,
    classId: progress.classId,
    studentId: progress.studentId,
  });
  if (!allowed) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const patch = { ...req.body };
  delete patch.studentId;
  delete patch.classId;

  if (patch.sessions && !Array.isArray(patch.sessions)) {
    patch.sessions = [];
  }
  patch.updatedAt = Date.now();

  const updated = await Progress.findByIdAndUpdate(req.params.id, patch, {
    new: true,
    runValidators: true,
  });
  res.json(updated);
});

exports.getMyProfile = asyncHandler(async (req, res) => {
  const teacher = await User.findById(req.user._id).select(
    "_id username email fullName phone specialization experienceYears certification avatarUrl role",
  );
  if (!teacher || teacher.role !== "Teacher") {
    return res.status(404).json({ message: "Không tìm thấy hồ sơ giáo viên" });
  }
  res.json({
    _id: teacher._id,
    username: teacher.username || "",
    email: teacher.email || "",
    fullName: teacher.fullName || "",
    phone: teacher.phone || "",
    specialization: teacher.specialization || "",
    experienceYears: teacher.experienceYears ?? null,
    certificates: teacher.certification || "",
    avatarUrl: teacher.avatarUrl || "",
    role: teacher.role,
  });
});

exports.updateMyProfile = asyncHandler(async (req, res) => {
  const teacher = await User.findById(req.user._id);
  if (!teacher || teacher.role !== "Teacher") {
    return res.status(404).json({ message: "Không tìm thấy hồ sơ giáo viên" });
  }

  const {
    fullName,
    phone,
    specialization,
    certificates,
    avatarUrl,
    experienceYears,
  } = req.body;

  if (typeof fullName === "string") teacher.fullName = fullName;
  if (typeof phone === "string") teacher.phone = phone;
  if (typeof specialization === "string") teacher.specialization = specialization;
  if (typeof certificates === "string") teacher.certification = certificates;
  if (typeof avatarUrl === "string") teacher.avatarUrl = avatarUrl;
  if (experienceYears === null || experienceYears === "") {
    teacher.experienceYears = undefined;
  } else if (experienceYears !== undefined) {
    const years = Number(experienceYears);
    if (Number.isNaN(years) || years < 0) {
      return res.status(400).json({ message: "Số năm kinh nghiệm không hợp lệ" });
    }
    teacher.experienceYears = years;
  }

  await teacher.save();

  res.json({
    _id: teacher._id,
    username: teacher.username || "",
    email: teacher.email || "",
    fullName: teacher.fullName || "",
    phone: teacher.phone || "",
    specialization: teacher.specialization || "",
    experienceYears: teacher.experienceYears ?? null,
    certificates: teacher.certification || "",
    avatarUrl: teacher.avatarUrl || "",
    role: teacher.role,
  });
});

exports.changeMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới" });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
  }

  const teacher = await User.findById(req.user._id);
  if (!teacher || teacher.role !== "Teacher") {
    return res.status(404).json({ message: "Không tìm thấy hồ sơ giáo viên" });
  }

  const matched = await teacher.matchPassword(currentPassword);
  if (!matched) {
    return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
  }

  teacher.password = newPassword;
  await teacher.save();
  res.json({ message: "Đổi mật khẩu thành công" });
});
