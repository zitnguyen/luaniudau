const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../middleware/asyncHandler");

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng" });
  }
  res.json(user);
});

exports.createUser = asyncHandler(async (req, res) => {
  const {
    username,
    fullName,
    email,
    phone,
    password,
    role,
    specialization,
    experienceYears,
    certification,
    avatarUrl,
    lastname,
    firstname,
  } = req.body;

  const userExists = await User.findOne({
    $or: [{ email }, { username }, { phone }],
  });
  if (userExists) {
    return res.status(409).json({ message: "Người dùng đã tồn tại" });
  }

  const finalFullName = String(fullName || `${lastname || ""} ${firstname || ""}`).trim();

  let user;
  if (role === "Teacher") {
    user = await Teacher.create({
      username,
      fullName: finalFullName,
      email,
      phone,
      password,
      role,
      specialization,
      experienceYears,
      certification,
      avatarUrl: avatarUrl || "",
    });
  } else {
    user = await User.create({
      username,
      fullName: finalFullName,
      email,
      phone,
      password,
      role: role || "Parent",
      avatarUrl: avatarUrl || "",
    });
  }

  res.status(201).json({
    _id: user._id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter);
  res.json(users);
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng" });
  }
  res.json(user);
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { password, ...updateData } = req.body;

  let user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng" });
  }
  if (password && password.trim() !== "") {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }
  if (user.role === "Teacher") {
    user = await Teacher.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
  } else {
    user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  res.json(user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa người dùng" });
});

exports.getTeachers = asyncHandler(async (req, res) => {
  const keyword = String(req.query.keyword || "").trim();
  const filter = { role: "Teacher" };
  if (keyword) {
    filter.$or = [
      { fullName: { $regex: keyword, $options: "i" } },
      { username: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
      { phone: { $regex: keyword, $options: "i" } },
      { specialization: { $regex: keyword, $options: "i" } },
    ];
  }

  const teachers = await User.find(filter)
    .select(
      "_id username fullName email phone role specialization experienceYears certification avatarUrl createdAt",
    )
    .sort({ createdAt: -1 })
    .lean();

  res.json(
    teachers.map((teacher) => ({
      ...teacher,
      status: "Active",
    })),
  );
});

exports.getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await User.findOne({ _id: req.params.id, role: "Teacher" })
    .select(
      "_id username fullName email phone role specialization experienceYears certification avatarUrl createdAt",
    )
    .lean();

  if (!teacher) {
    return res.status(404).json({ message: "Không tìm thấy giáo viên" });
  }

  const classes = await Class.find({ teacherId: teacher._id })
    .select("_id className status schedule")
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    id: teacher._id,
    username: teacher.username || "",
    email: teacher.email || "",
    fullName: teacher.fullName || "",
    phone: teacher.phone || "",
    specialization: teacher.specialization || "",
    experienceYears: teacher.experienceYears || 0,
    certificates: teacher.certification || "",
    avatarUrl: teacher.avatarUrl || "",
    status: "Active",
    classes,
    classCount: classes.length,
  });
});

exports.getOnlineUsers = asyncHandler(async (_req, res) => {
  const onlineThresholdMinutes = Number(process.env.ONLINE_USER_THRESHOLD_MINUTES || 5);
  const threshold = new Date(Date.now() - onlineThresholdMinutes * 60 * 1000);

  const users = await User.find({
    role: { $in: ["Admin", "Teacher", "Parent", "Student"] },
    isOnline: true,
    lastSeenAt: { $gte: threshold },
  })
    .select("_id username fullName role avatarUrl lastSeenAt isOnline")
    .sort({ lastSeenAt: -1 })
    .lean();

  res.json({
    totalOnline: users.length,
    thresholdMinutes: onlineThresholdMinutes,
    users: users.map((user) => ({
      ...user,
      displayName: user.fullName || user.username || "Unknown",
    })),
  });
});

exports.getUserActivityStatuses = asyncHandler(async (_req, res) => {
  const onlineThresholdMinutes = Number(process.env.ONLINE_USER_THRESHOLD_MINUTES || 5);
  const thresholdMs = onlineThresholdMinutes * 60 * 1000;
  const nowMs = Date.now();

  const users = await User.find({
    role: { $in: ["Admin", "Teacher", "Parent", "Student"] },
  })
    .select("_id username fullName role avatarUrl lastSeenAt isOnline")
    .sort({ lastSeenAt: -1, createdAt: -1 })
    .lean();

  const activityUsers = users.map((user) => {
    const lastSeenMs = user?.lastSeenAt ? new Date(user.lastSeenAt).getTime() : 0;
    const isActive = Boolean(user.isOnline) && lastSeenMs > 0 && nowMs - lastSeenMs <= thresholdMs;
    return {
      ...user,
      displayName: user.fullName || user.username || "Unknown",
      isActive,
    };
  });

  const onlineCount = activityUsers.filter((u) => u.isActive).length;
  res.json({
    thresholdMinutes: onlineThresholdMinutes,
    totalUsers: activityUsers.length,
    totalOnline: onlineCount,
    users: activityUsers,
  });
});
