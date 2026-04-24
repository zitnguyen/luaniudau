const Student = require("../models/Student");
const Class = require("../models/Class");
const asyncHandler = require("../middleware/asyncHandler");
const DAY_MAP = { CN: 0, T2: 1, T3: 2, T4: 3, T5: 4, T6: 5, T7: 6 };

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

const hydrateStudents = async (classes = []) => {
  const allStudentIds = [
    ...new Set(
      classes.flatMap((item) => (item.studentIds || []).map((id) => String(id)).filter(Boolean)),
    ),
  ];
  if (allStudentIds.length === 0) {
    return classes.map((item) => ({ ...item, studentDocs: [] }));
  }
  const students = await Student.find({ _id: { $in: allStudentIds }, isDeleted: { $ne: true } })
    .select("fullName studentId skillLevel parentId")
    .lean();
  const byId = new Map(students.map((s) => [String(s._id), s]));
  return classes.map((item) => ({
    ...item,
    studentDocs: (item.studentIds || [])
      .map((id) => byId.get(String(id)))
      .filter(Boolean),
  }));
};

exports.getAllSchedules = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user?.role === "Teacher") {
    filter.teacherId = req.user._id;
  } else if (req.user?.role === "Parent") {
    const childIds = await Student.find({
      parentId: req.user._id,
      isDeleted: { $ne: true },
    }).distinct("_id");
    filter.studentIds = { $in: childIds };
  } else if (req.user?.role === "Student") {
    filter.studentIds = req.user._id;
  }

  const classes = await Class.find(filter)
    .populate("teacherId", "fullName username email")
    .sort("-createdAt");
  const hydratedClasses = await hydrateStudents(classes.map((item) => item.toObject()));
  const schedules = hydratedClasses.map((item) => ({
    classId: item._id,
    className: item.className,
    startDate: item.startDate,
    room: item.room,
    status: item.status,
    teacher: item.teacherId,
    students: item.studentDocs || [],
    scheduleSlots:
      Array.isArray(item.scheduleSlots) && item.scheduleSlots.length > 0
        ? item.scheduleSlots
        : buildScheduleSlotsFromLegacy(item.schedule),
    schedule: item.schedule || "",
  }));
  res.json(schedules);
});
