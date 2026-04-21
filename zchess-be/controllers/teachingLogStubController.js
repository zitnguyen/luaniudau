const asyncHandler = require("../middleware/asyncHandler");
const TeachingLog = require("../models/TeachingLog");
const Class = require("../models/Class");

const toMinutes = (value) => {
  const [h, m] = String(value || "")
    .split(":")
    .map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const computeDurationHours = (startTime, endTime) => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (start == null || end == null || end <= start) return null;
  return Number(((end - start) / 60).toFixed(2));
};

const ensureTeacherOwnsClass = async (classId, reqUser) => {
  if (reqUser.role !== "Teacher") return true;
  const ownClass = await Class.exists({ _id: classId, teacherId: reqUser._id });
  return Boolean(ownClass);
};

exports.listMine = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === "Teacher") {
    query.teacherId = req.user._id;
  } else if (req.query.teacherId) {
    query.teacherId = req.query.teacherId;
  }

  const logs = await TeachingLog.find(query)
    .populate("classId", "className schedule")
    .populate("teacherId", "fullName username")
    .sort({ date: -1, createdAt: -1 });

  res.json(logs);
});

exports.create = asyncHandler(async (req, res) => {
  const { classId, date, startTime, endTime, note } = req.body;
  const canAccess = await ensureTeacherOwnsClass(classId, req.user);
  if (!canAccess) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const durationHours =
    req.body.durationHours != null
      ? Number(req.body.durationHours)
      : computeDurationHours(startTime, endTime);

  if (!durationHours || durationHours <= 0) {
    return res
      .status(400)
      .json({ message: "Thời lượng không hợp lệ. Kiểm tra startTime/endTime." });
  }

  const log = await TeachingLog.create({
    classId,
    teacherId: req.user.role === "Teacher" ? req.user._id : req.body.teacherId,
    date: date ? new Date(date) : new Date(),
    startTime,
    endTime,
    durationHours,
    note: note || "",
    status: req.user.role === "Admin" ? req.body.status || "Pending" : "Pending",
    createdBy: req.user._id,
  });

  const populated = await TeachingLog.findById(log._id)
    .populate("classId", "className schedule")
    .populate("teacherId", "fullName username");

  res.status(201).json(populated);
});

exports.update = asyncHandler(async (req, res) => {
  const log = await TeachingLog.findById(req.params.id);
  if (!log) {
    return res.status(404).json({ message: "Không tìm thấy teaching log" });
  }
  if (req.user.role === "Teacher" && String(log.teacherId) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const patch = { ...req.body };
  delete patch.teacherId;
  if (req.user.role !== "Admin") {
    delete patch.salary;
    delete patch.status;
  }

  const start = patch.startTime ?? log.startTime;
  const end = patch.endTime ?? log.endTime;
  if (patch.startTime !== undefined || patch.endTime !== undefined) {
    const duration = computeDurationHours(start, end);
    if (!duration || duration <= 0) {
      return res.status(400).json({ message: "startTime/endTime không hợp lệ" });
    }
    patch.durationHours = duration;
  } else if (patch.durationHours !== undefined) {
    patch.durationHours = Number(patch.durationHours);
  }

  if (patch.date) patch.date = new Date(patch.date);

  const updated = await TeachingLog.findByIdAndUpdate(req.params.id, patch, {
    new: true,
    runValidators: true,
  })
    .populate("classId", "className schedule")
    .populate("teacherId", "fullName username");

  res.json(updated);
});

exports.remove = asyncHandler(async (req, res) => {
  const log = await TeachingLog.findById(req.params.id);
  if (!log) {
    return res.status(404).json({ message: "Không tìm thấy teaching log" });
  }
  if (req.user.role === "Teacher" && String(log.teacherId) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await TeachingLog.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa teaching log" });
});
