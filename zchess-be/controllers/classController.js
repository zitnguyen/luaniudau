const Class = require("../models/Class");
const Student = require("../models/Student");
const asyncHandler = require("../middleware/asyncHandler");
const DAY_MAP = { CN: 0, T2: 1, T3: 2, T4: 3, T5: 4, T6: 5, T7: 6 };

const CLASS_POPULATE = [
  { path: "teacherId", select: "fullName username email phone" },
];

const buildScheduleSlotsFromLegacy = (schedule) => {
  if (!schedule || typeof schedule !== "string") return [];
  const timeMatch = schedule.match(/\((.*?)\)/);
  if (!timeMatch?.[1]) return [];
  const time = timeMatch[1].trim();
  const hhmm = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!hhmm.test(time)) return [];
  const daysPart = schedule.split("(")[0] || "";
  const days = daysPart
    .split("/")
    .map((d) => d.trim().toUpperCase())
    .filter(Boolean);
  return days
    .map((day) => DAY_MAP[day])
    .filter((day) => Number.isInteger(day))
    .map((day) => ({ day, time, duration: 90 }));
};

const normalizePayload = (body = {}) => {
  const payload = { ...body };
  const hasStudents =
    Object.prototype.hasOwnProperty.call(payload, "studentIds") ||
    Object.prototype.hasOwnProperty.call(payload, "students");
  if (hasStudents) {
    const incomingStudents = payload.studentIds || payload.students || [];
    payload.studentIds = Array.isArray(incomingStudents) ? incomingStudents : [];
  }
  delete payload.students;
  if (!Array.isArray(payload.scheduleSlots) || payload.scheduleSlots.length === 0) {
    payload.scheduleSlots = buildScheduleSlotsFromLegacy(payload.schedule);
  }
  if (Array.isArray(payload.studentIds)) {
    payload.currentStudents = payload.studentIds.length;
  }
  return payload;
};

const shapeResponse = (classDoc) => {
  const plain = classDoc.toObject ? classDoc.toObject() : classDoc;
  const currentStudents = Array.isArray(plain.studentIds)
    ? plain.studentIds.length
    : Number(plain.currentStudents || 0);
  return { ...plain, currentStudents };
};

const hydrateStudentsForClasses = async (classes = []) => {
  const allStudentIds = [
    ...new Set(
      classes.flatMap((item) =>
        (item.studentIds || []).map((s) => String(s?._id || s)).filter(Boolean),
      ),
    ),
  ];
  if (allStudentIds.length === 0) return classes;
  const students = await Student.find({ _id: { $in: allStudentIds }, isDeleted: { $ne: true } })
    .select("fullName studentId skillLevel parentId")
    .lean();
  const byId = new Map(students.map((s) => [String(s._id), s]));
  return classes.map((item) => ({
    ...item,
    studentIds: (item.studentIds || [])
      .map((s) => byId.get(String(s?._id || s)))
      .filter(Boolean),
  }));
};

exports.createClass = asyncHandler(async (req, res) => {
  const payload = normalizePayload(req.body);
  payload.status = payload.status || "Pending";
  const created = await Class.create(payload);
  const newClass = await Class.findById(created._id).populate(CLASS_POPULATE);

  res.status(201).json(shapeResponse(newClass));
});

exports.getAllClasses = asyncHandler(async (req, res) => {
  const { teacherId, status, keyword } = req.query;
  const filter = {};

  if (teacherId) filter.teacherId = teacherId;
  if (status) filter.status = status;
  if (keyword) {
    filter.className = { $regex: keyword, $options: "i" };
  }

  const classes = await Class.find(filter)
    .populate(CLASS_POPULATE)
    .sort("-createdAt");
  const shaped = classes.map(shapeResponse);
  const hydrated = await hydrateStudentsForClasses(shaped);
  res.json(hydrated);
});

exports.getClassesByTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const filter = { teacherId };

  if (
    req.user &&
    req.user.role === "Teacher" &&
    String(req.user._id) !== String(teacherId)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const classes = await Class.find(filter)
    .populate(CLASS_POPULATE)
    .sort("-createdAt");
  const shaped = classes.map(shapeResponse);
  const hydrated = await hydrateStudentsForClasses(shaped);
  res.json(hydrated);
});

exports.getClassById = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id).populate(CLASS_POPULATE);

  if (!classItem) {
    return res.status(404).json({ message: "Lớp học không tồn tại" });
  }

  const shaped = shapeResponse(classItem);
  const [hydrated] = await hydrateStudentsForClasses([shaped]);
  res.json(hydrated);
});

exports.updateClass = asyncHandler(async (req, res) => {
  const payload = normalizePayload(req.body);
  const classItem = await Class.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  }).populate(CLASS_POPULATE);

  if (!classItem) {
    return res.status(404).json({ message: "Lớp học không tồn tại" });
  }

  const shaped = shapeResponse(classItem);
  const [hydrated] = await hydrateStudentsForClasses([shaped]);
  res.json(hydrated);
});

exports.deleteClass = asyncHandler(async (req, res) => {
  const classItem = await Class.findByIdAndDelete(req.params.id);
  if (!classItem) {
    return res.status(404).json({ message: "Lớp học không tồn tại" });
  }

  res.json({ message: "Đã xóa lớp học" });
});

exports.addStudentToClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;
  if (!studentId) {
    return res.status(400).json({ message: "Thiếu studentId" });
  }
  const updated = await Class.findByIdAndUpdate(
    id,
    { $addToSet: { studentIds: studentId } },
    { new: true, runValidators: true },
  ).populate(CLASS_POPULATE);
  if (!updated) return res.status(404).json({ message: "Lớp học không tồn tại" });
  if (Array.isArray(updated.studentIds)) {
    updated.currentStudents = updated.studentIds.length;
    await updated.save();
  }
  const shaped = shapeResponse(updated);
  const [hydrated] = await hydrateStudentsForClasses([shaped]);
  res.json(hydrated);
});

exports.removeStudentFromClass = asyncHandler(async (req, res) => {
  const { id, studentId } = req.params;
  const updated = await Class.findByIdAndUpdate(
    id,
    { $pull: { studentIds: studentId } },
    { new: true, runValidators: true },
  ).populate(CLASS_POPULATE);
  if (!updated) return res.status(404).json({ message: "Lớp học không tồn tại" });
  if (Array.isArray(updated.studentIds)) {
    updated.currentStudents = updated.studentIds.length;
    await updated.save();
  }
  const shaped = shapeResponse(updated);
  const [hydrated] = await hydrateStudentsForClasses([shaped]);
  res.json(hydrated);
});
