const Schedule = require("../models/Schedule");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Enrollment = require("../models/Enrollment");
const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");

const DAY_MAP = {
  CN: 0,
  T2: 1,
  T3: 2,
  T4: 3,
  T5: 4,
  T6: 5,
  T7: 6,
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const normalizeTime = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const hhmm = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const hhmmss = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  if (hhmm.test(trimmed)) return trimmed;
  if (hhmmss.test(trimmed)) return trimmed.slice(0, 5);
  return null;
};

const normalizeDay = (day) => {
  if (typeof day === "number" && day >= 0 && day <= 6) return day;
  if (typeof day === "string") {
    const key = day.trim().toUpperCase();
    if (key in DAY_MAP) return DAY_MAP[key];
    const asNumber = Number(key);
    if (Number.isInteger(asNumber) && asNumber >= 0 && asNumber <= 6) return asNumber;
  }
  return null;
};

const normalizeSlots = (slots) => {
  if (!Array.isArray(slots) || slots.length === 0) {
    return { error: "Slots không hợp lệ" };
  }

  const normalized = [];
  for (const slot of slots) {
    const day = normalizeDay(slot?.day);
    const time = normalizeTime(slot?.time);
    if (day === null) {
      return { error: `Ngày học không hợp lệ: ${slot?.day}` };
    }
    if (!time) {
      return { error: `Giờ học không hợp lệ: ${slot?.time}` };
    }
    normalized.push({
      day,
      time,
      duration: Number(slot?.duration) > 0 ? Number(slot.duration) : 90,
    });
  }

  return { normalized };
};

exports.getAllSchedules = asyncHandler(async (req, res) => {
  if (req.user?.role === "Admin") {
    const existingStudentIds = await Student.find({ isDeleted: { $ne: true } }).distinct(
      "_id",
    );
    await Schedule.deleteMany({ studentId: { $nin: existingStudentIds } });
  }

  const filter = {};
  if (req.user?.role === "Parent") {
    const childIds = await Student.find({
      parentId: req.user._id,
      isDeleted: { $ne: true },
    }).distinct("_id");
    filter.studentId = { $in: childIds };
  } else if (req.user?.role === "Teacher") {
    const classIds = await Class.find({ teacherId: req.user._id }).distinct("_id");
    const studentIds = await Enrollment.find({ classId: { $in: classIds } }).distinct(
      "studentId",
    );
    filter.studentId = { $in: studentIds };
  }

  const schedules = await Schedule.find(filter)
    .populate("studentId", "fullName studentId skillLevel teacherId parentId")
    .sort({ scheduleId: -1 });
  res.json(schedules);
});

exports.getByStudentId = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  if (!isValidObjectId(studentId)) {
    return res.status(400).json({ message: "Invalid studentId format" });
  }
  if (req.user && req.user.role === "Parent") {
    const ok = await Student.exists({
      _id: studentId,
      parentId: req.user._id,
      isDeleted: { $ne: true },
    });
    if (!ok) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  if (req.user && req.user.role === "Teacher") {
    const classIds = await Class.find({ teacherId: req.user._id }).distinct("_id");
    const enrolled = await Enrollment.exists({
      classId: { $in: classIds },
      studentId,
    });
    if (!enrolled) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  const schedule = await Schedule.findOne({ studentId });
  res.json(schedule);
});

exports.upsertByStudentId = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { slots, startDate, room } = req.body;
  if (!isValidObjectId(studentId)) {
    return res.status(400).json({ message: "Invalid studentId format" });
  }

  const studentDoc = await Student.findOne({
    _id: studentId,
    isDeleted: { $ne: true },
  });
  if (!studentDoc) {
    return res.status(404).json({ message: "Student không tồn tại" });
  }
  if (req.user?.role === "Teacher") {
    const ownClass = await Class.exists({
      teacherId: req.user._id,
      _id: { $in: await Enrollment.find({ studentId }).distinct("classId") },
    });
    if (!ownClass) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const { normalized, error } = normalizeSlots(slots);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const existing = await Schedule.findOne({ studentId });
  let nextScheduleId = existing?.scheduleId;
  if (!nextScheduleId) {
    const last = await Schedule.findOne({ scheduleId: { $type: "number" } }).sort({
      scheduleId: -1,
    });
    nextScheduleId = last?.scheduleId ? Number(last.scheduleId) + 1 : 1;
  }

  const schedule = await Schedule.findOneAndUpdate(
    { studentId },
    {
      studentId,
      scheduleId: nextScheduleId,
      slots: normalized,
      startDate,
      room,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  res.json(schedule);
});

exports.deleteByStudentId = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  if (!isValidObjectId(studentId)) {
    return res.status(400).json({ message: "Invalid studentId format" });
  }
  if (req.user?.role === "Teacher") {
    const ownClass = await Class.exists({
      teacherId: req.user._id,
      _id: { $in: await Enrollment.find({ studentId }).distinct("classId") },
    });
    if (!ownClass) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  await Schedule.findOneAndDelete({ studentId });
  res.json({ message: "Đã xóa lịch học" });
});
