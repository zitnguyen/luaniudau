const Student = require("../models/Student");
const User = require("../models/User");
const Schedule = require("../models/Schedule");
const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const SKILL_LEVELS = new Set([
  "kid1",
  "kid2",
  "level1",
  "level2",
  "level3",
  "level4",
  "level5",
  "level6",
  "level7",
  "level8",
  "level9",
  "level10",
]);

const sendSuccess = (res, { status = 200, data, message = "" }) => {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
};

const sendFail = (res, { status = 400, message }) => {
  return res.status(status).json({
    success: false,
    data: null,
    message,
  });
};

const normalizeSkillLevel = (raw) => {
  if (!raw || typeof raw !== "string") return undefined;
  const value = raw.trim().toLowerCase();
  const aliases = {
    beginner: "level1",
    basic: "level1",
    advanced: "level10",
    kid: "kid1",
    "kid beginner": "kid1",
    "kid advanced": "kid2",
  };
  const normalized = aliases[value] || value;
  return SKILL_LEVELS.has(normalized) ? normalized : undefined;
};

const safeNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const pickStudentPayload = (body) => {
  const hasTotalSessions = body.totalSessions !== undefined;
  const hasTotalLessons =
    body.totalLessons !== undefined || body.sessionsTotal !== undefined;
  const hasCompletedLessons = body.completedLessons !== undefined;
  const totalSessions = hasTotalSessions
    ? safeNumber(body.totalSessions, 0)
    : undefined;
  const totalLessons = hasTotalLessons
    ? safeNumber(
        body.totalLessons !== undefined ? body.totalLessons : body.sessionsTotal,
        0,
      )
    : undefined;
  const completedLessons = hasCompletedLessons
    ? safeNumber(body.completedLessons, 0)
    : undefined;
  const normalizedSkillLevel = normalizeSkillLevel(body.skillLevel);

  const payload = {};
  if (body.fullName !== undefined) payload.fullName = body.fullName;
  if (body.dateOfBirth !== undefined) payload.dateOfBirth = body.dateOfBirth;
  if (body.enrollmentDate !== undefined) {
    payload.enrollmentDate = body.enrollmentDate;
  }
  if (body.address !== undefined) payload.address = body.address;
  if (body.teacherId !== undefined) payload.teacherId = body.teacherId || undefined;
  if (normalizedSkillLevel) payload.skillLevel = normalizedSkillLevel;
  if (hasTotalSessions) payload.totalSessions = totalSessions;
  if (hasTotalLessons) payload.totalLessons = totalLessons;
  if (hasCompletedLessons) payload.completedLessons = completedLessons;
  if (body.note !== undefined) payload.note = body.note;
  return payload;
};

const findParentByPayload = async (req) => {
  const parentPhone = req.body.parentPhone;
  const parentId = req.body.parentId;

  if (parentPhone) {
    return User.findOne({ phone: parentPhone, role: "Parent" });
  }

  if (parentId) {
    if (!isValidObjectId(parentId)) {
      return null;
    }
    return User.findOne({ _id: parentId, role: "Parent" });
  }

  return null;
};

exports.createStudent = asyncHandler(async (req, res) => {
  if (!req.body.fullName) {
    return sendFail(res, {
      status: 400,
      message: "Thiếu thông tin tên học viên",
    });
  }
  if (req.body.skillLevel && !normalizeSkillLevel(req.body.skillLevel)) {
    return sendFail(res, {
      status: 400,
      message: "skillLevel không hợp lệ",
    });
  }

  const parent = await findParentByPayload(req);
  if (!parent) {
    return sendFail(res, {
      status: 400,
      message: "Không tìm thấy phụ huynh hợp lệ",
    });
  }

  const payload = pickStudentPayload(req.body);
  if (payload.totalSessions === undefined) payload.totalSessions = 0;
  if (payload.totalLessons === undefined) payload.totalLessons = 0;
  if (payload.completedLessons === undefined) payload.completedLessons = 0;
  if (payload.completedLessons > payload.totalLessons) {
    payload.completedLessons = payload.totalLessons;
  }
  const duplicateFilter = {
    fullName: payload.fullName,
    parentId: parent._id,
  };
  if (payload.dateOfBirth) {
    duplicateFilter.dateOfBirth = payload.dateOfBirth;
  }

  const duplicate = await Student.findOne({
    ...duplicateFilter,
    isDeleted: { $ne: true },
  });
  if (duplicate) {
    return sendFail(res, {
      status: 409,
      message: "Học viên đã tồn tại",
    });
  }

  const student = await Student.create({
    ...payload,
    parentId: parent._id,
  });

  await student.populate("parentId", "fullName email phone");
  await student.populate("teacherId", "fullName username email phone");

  return sendSuccess(res, {
    status: 201,
    data: student,
    message: "Tạo học viên thành công",
  });
});

exports.getAllStudents = asyncHandler(async (req, res) => {
  const { parentId, keyword, includeDeleted } = req.query;
  const filter = {
    isDeleted: includeDeleted === "true" ? { $in: [true, false] } : { $ne: true },
  };

  if (parentId) filter.parentId = parentId;
  if (keyword) {
    filter.fullName = { $regex: keyword, $options: "i" };
  }

  const students = await Student.find(filter)
    .populate("parentId", "fullName email phone")
    .populate("teacherId", "fullName username email phone")
    .sort("-createdAt");

  return sendSuccess(res, {
    data: students,
    message: "Lấy danh sách học viên thành công",
  });
});

exports.getStudentById = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return sendFail(res, {
      status: 400,
      message: "Invalid ID format",
    });
  }

  const student = await Student.findById(req.params.id).populate(
    "parentId",
    "fullName email phone",
  );
  await student?.populate("teacherId", "fullName username email phone");

  if (!student) {
    return sendFail(res, {
      status: 404,
      message: "Học viên không tồn tại",
    });
  }
  if (student.isDeleted) {
    return sendFail(res, {
      status: 404,
      message: "Học viên đã bị xóa",
    });
  }

  return sendSuccess(res, {
    data: student,
    message: "Lấy chi tiết học viên thành công",
  });
});

exports.updateStudent = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return sendFail(res, {
      status: 400,
      message: "Invalid ID format",
    });
  }

  const existing = await Student.findOne({
    _id: req.params.id,
    isDeleted: { $ne: true },
  });
  if (!existing) {
    return sendFail(res, {
      status: 404,
      message: "Học viên không tồn tại",
    });
  }
  if (req.body.skillLevel && !normalizeSkillLevel(req.body.skillLevel)) {
    return sendFail(res, {
      status: 400,
      message: "skillLevel không hợp lệ",
    });
  }
  if (req.body.fullName !== undefined && !String(req.body.fullName).trim()) {
    return sendFail(res, {
      status: 400,
      message: "Thiếu thông tin tên học viên",
    });
  }

  let nextParentId = existing.parentId;
  if (req.body.parentPhone || req.body.parentId) {
    const parent = await findParentByPayload(req);
    if (!parent) {
      return sendFail(res, {
        status: 400,
        message: "Không tìm thấy phụ huynh hợp lệ",
      });
    }
    nextParentId = parent._id;
  }

  const payload = pickStudentPayload(req.body);
  if (payload.totalSessions === undefined) payload.totalSessions = existing.totalSessions;
  if (payload.totalLessons === undefined) payload.totalLessons = existing.totalLessons;
  if (payload.completedLessons === undefined) {
    payload.completedLessons = existing.completedLessons;
  }
  if (payload.completedLessons > payload.totalLessons) {
    payload.completedLessons = payload.totalLessons;
  }
  payload.parentId = nextParentId;

  const student = await Student.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  })
    .populate("parentId", "fullName email phone")
    .populate("teacherId", "fullName username email phone");

  return sendSuccess(res, {
    data: student,
    message: "Cập nhật học viên thành công",
  });
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return sendFail(res, {
      status: 400,
      message: "Invalid ID format",
    });
  }

  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, isDeleted: { $ne: true } },
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  );
  if (!student) {
    return sendFail(res, {
      status: 404,
      message: "Học viên không tồn tại",
    });
  }

  await Schedule.deleteMany({ studentId: student._id });

  return sendSuccess(res, {
    data: { id: req.params.id, isDeleted: true },
    message: "Đã xóa mềm hồ sơ học viên và xóa lịch học liên quan",
  });
});

exports.getMyChildren = asyncHandler(async (req, res) => {
  const students = await Student.find({
    parentId: req.user._id,
    isDeleted: { $ne: true },
  }).sort("-createdAt");
  return sendSuccess(res, {
    data: students,
    message: "Lấy danh sách con của phụ huynh thành công",
  });
});

exports.getStudentsByParentId = asyncHandler(async (req, res) => {
  const { parentId } = req.params;
  if (!isValidObjectId(parentId)) {
    return sendFail(res, {
      status: 400,
      message: "Invalid ID format",
    });
  }

  if (
    req.user.role === "Parent" &&
    String(req.user._id) !== String(parentId)
  ) {
    return sendFail(res, {
      status: 403,
      message: "Forbidden",
    });
  }

  const students = await Student.find({ parentId, isDeleted: { $ne: true } })
    .populate("parentId", "fullName email phone")
    .populate("teacherId", "fullName username email phone")
    .sort("-createdAt");

  return sendSuccess(res, {
    data: students,
    message: "Lấy học viên theo phụ huynh thành công",
  });
});
