const asyncHandler = require("../middleware/asyncHandler");
const TeachingLog = require("../models/TeachingLog");
const Class = require("../models/Class");
const User = require("../models/User");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");

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

const toTeacherSessionDto = (log) => ({
  _id: log._id,
  teacherId: log.teacherId,
  classId: log.classId,
  date: log.date,
  startTime: log.startTime,
  endTime: log.endTime,
  durationHours: log.durationHours,
  note: log.note || "",
  status: log.status,
  createdAt: log.createdAt,
  updatedAt: log.updatedAt,
});

const parseMonthYear = (month, year) => {
  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(m) || m < 1 || m > 12) return null;
  if (!Number.isInteger(y) || y < 2000 || y > 3000) return null;
  return { m, y };
};

const sanitizeFilename = (value) =>
  String(value || "Teacher")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");

exports.createTeacherSession = asyncHandler(async (req, res) => {
  const classId = req.body.class_id || req.body.classId;
  const date = req.body.date;
  const startTime = req.body.start_time || req.body.startTime;
  const endTime = req.body.end_time || req.body.endTime;
  const note = req.body.note || "";

  if (req.body.salary !== undefined) {
    return res.status(400).json({ message: "Teacher không được phép nhập lương" });
  }
  if (!classId || !date || !startTime || !endTime) {
    return res.status(400).json({ message: "Thiếu thông tin ca dạy bắt buộc" });
  }

  const ownClass = await Class.exists({ _id: classId, teacherId: req.user._id });
  if (!ownClass) {
    return res.status(403).json({ message: "Bạn chỉ được tạo ca dạy cho lớp của mình" });
  }

  const durationHours = computeDurationHours(startTime, endTime);
  if (!durationHours || durationHours <= 0) {
    return res.status(400).json({ message: "start_time / end_time không hợp lệ" });
  }

  const session = await TeachingLog.create({
    classId,
    teacherId: req.user._id,
    date: new Date(date),
    startTime,
    endTime,
    durationHours,
    note,
    salary: null,
    status: "Pending",
    createdBy: req.user._id,
  });

  const populated = await TeachingLog.findById(session._id)
    .populate("classId", "className schedule")
    .populate("teacherId", "fullName username");

  return res.status(201).json(toTeacherSessionDto(populated));
});

exports.createAdminSession = asyncHandler(async (req, res) => {
  const { teacherId, classId, date, startTime, endTime, note = "", salary } = req.body || {};
  if (!teacherId || !classId || !date || !startTime || !endTime) {
    return res.status(400).json({ message: "Thiếu teacherId, classId, date, startTime hoặc endTime" });
  }

  const teacher = await User.findOne({ _id: teacherId, role: "Teacher" }).select("_id");
  if (!teacher) {
    return res.status(404).json({ message: "Không tìm thấy giáo viên" });
  }
  const classDoc = await Class.findById(classId).select("_id teacherId");
  if (!classDoc) {
    return res.status(404).json({ message: "Không tìm thấy lớp học" });
  }
  if (String(classDoc.teacherId) !== String(teacherId)) {
    return res.status(400).json({ message: "Lớp học không thuộc giáo viên đã chọn" });
  }

  const durationHours = computeDurationHours(startTime, endTime);
  if (!durationHours || durationHours <= 0) {
    return res.status(400).json({ message: "startTime / endTime không hợp lệ" });
  }

  const normalizedSalary =
    salary === undefined || salary === null || salary === ""
      ? null
      : Number(salary);
  if (normalizedSalary !== null && (!Number.isFinite(normalizedSalary) || normalizedSalary < 0)) {
    return res.status(400).json({ message: "Salary không hợp lệ" });
  }

  const created = await TeachingLog.create({
    classId,
    teacherId,
    date: new Date(date),
    startTime,
    endTime,
    durationHours,
    note,
    salary: normalizedSalary,
    status: normalizedSalary == null ? "Pending" : "Confirmed",
    createdBy: req.user._id,
  });

  const populated = await TeachingLog.findById(created._id)
    .populate("classId", "className schedule")
    .populate("teacherId", "fullName username");
  return res.status(201).json(populated);
});

exports.getTeacherSessions = asyncHandler(async (req, res) => {
  const sessions = await TeachingLog.find({ teacherId: req.user._id })
    .populate("classId", "className schedule")
    .sort({ date: -1, createdAt: -1 });

  return res.json(sessions.map(toTeacherSessionDto));
});

exports.getAdminPayroll = asyncHandler(async (req, res) => {
  const teachers = await User.find({ role: "Teacher" })
    .select("_id fullName username email phone")
    .sort({ fullName: 1, username: 1 });

  const aggregates = await TeachingLog.aggregate([
    {
      $group: {
        _id: "$teacherId",
        totalSessions: { $sum: 1 },
        totalHours: { $sum: "$durationHours" },
        totalSalary: { $sum: { $ifNull: ["$salary", 0] } },
        sessionsWithoutSalary: {
          $sum: {
            $cond: [{ $eq: ["$salary", null] }, 1, 0],
          },
        },
      },
    },
  ]);

  const byTeacherId = new Map(
    aggregates.map((item) => [String(item._id), item]),
  );

  const rows = teachers.map((teacher) => {
    const stats = byTeacherId.get(String(teacher._id));
    return {
      teacher,
      totalSessions: stats?.totalSessions || 0,
      totalHours: Number((stats?.totalHours || 0).toFixed(2)),
      totalSalary: stats?.totalSalary || 0,
      sessionsWithoutSalary: stats?.sessionsWithoutSalary || 0,
    };
  });

  return res.json(rows);
});

exports.getAdminPayrollByTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await User.findOne({ _id: teacherId, role: "Teacher" }).select(
    "_id fullName username email phone",
  );
  if (!teacher) {
    return res.status(404).json({ message: "Không tìm thấy giáo viên" });
  }

  const sessions = await TeachingLog.find({ teacherId })
    .populate("classId", "className schedule")
    .sort({ date: -1, createdAt: -1 });

  const totalSalary = sessions.reduce((sum, item) => sum + (item.salary || 0), 0);
  const totalHours = sessions.reduce((sum, item) => sum + (item.durationHours || 0), 0);

  return res.json({
    teacher,
    sessions,
    totalSalary,
    totalHours: Number(totalHours.toFixed(2)),
    totalSessions: sessions.length,
  });
});

exports.updateSessionSalary = asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  const salary = Number(req.body.salary);
  if (!Number.isFinite(salary) || salary < 0) {
    return res.status(400).json({ message: "Salary không hợp lệ" });
  }

  const session = await TeachingLog.findById(sessionId);
  if (!session) {
    return res.status(404).json({ message: "Không tìm thấy ca dạy" });
  }

  if (!session.createdBy) {
    session.createdBy = session.teacherId;
  }
  session.salary = salary;
  if (session.status === "Pending") {
    session.status = "Confirmed";
  }
  await session.save();

  const populated = await TeachingLog.findById(session._id)
    .populate("classId", "className schedule")
    .populate("teacherId", "fullName username");

  return res.json(populated);
});

exports.deleteSession = asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  const session = await TeachingLog.findByIdAndDelete(sessionId);
  if (!session) {
    return res.status(404).json({ message: "Không tìm thấy ca dạy" });
  }
  return res.json({ message: "Đã xóa ca dạy", id: sessionId });
});

exports.resetSessionSalary = asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  const session = await TeachingLog.findById(sessionId);
  if (!session) {
    return res.status(404).json({ message: "Không tìm thấy ca dạy" });
  }

  if (!session.createdBy) {
    session.createdBy = session.teacherId;
  }
  session.salary = null;
  if (session.status === "Paid") {
    session.status = "Confirmed";
  }
  await session.save();

  const populated = await TeachingLog.findById(session._id)
    .populate("classId", "className schedule")
    .populate("teacherId", "fullName username");

  return res.json(populated);
});

exports.getPayrollSummary = asyncHandler(async (req, res) => {
  const byTeacher = await TeachingLog.aggregate([
    {
      $group: {
        _id: "$teacherId",
        totalSessions: { $sum: 1 },
        totalHours: { $sum: "$durationHours" },
        totalSalary: { $sum: { $ifNull: ["$salary", 0] } },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "teacher",
      },
    },
    { $unwind: "$teacher" },
    { $match: { "teacher.role": "Teacher" } },
    {
      $project: {
        _id: 0,
        teacherId: "$teacher._id",
        teacherName: {
          $ifNull: ["$teacher.fullName", "$teacher.username"],
        },
        totalSessions: 1,
        totalHours: { $round: ["$totalHours", 2] },
        totalSalary: 1,
      },
    },
    { $sort: { teacherName: 1 } },
  ]);

  const totals = byTeacher.reduce(
    (acc, item) => {
      acc.totalTeachers += 1;
      acc.totalSessions += item.totalSessions || 0;
      acc.totalHours += item.totalHours || 0;
      acc.totalSalary += item.totalSalary || 0;
      return acc;
    },
    {
      totalTeachers: 0,
      totalSessions: 0,
      totalHours: 0,
      totalSalary: 0,
    },
  );

  totals.totalHours = Number(totals.totalHours.toFixed(2));

  return res.json({
    summary: totals,
    teachers: byTeacher,
  });
});

exports.exportPayslip = asyncHandler(async (req, res) => {
  const { teacherId, month, year, type = "excel" } = req.query;
  if (!teacherId || !month || !year) {
    return res.status(400).json({ message: "Thiếu teacherId, month hoặc year" });
  }

  const parsed = parseMonthYear(month, year);
  if (!parsed) {
    return res.status(400).json({ message: "month/year không hợp lệ" });
  }
  const normalizedType = String(type).toLowerCase();
  if (!["excel", "pdf"].includes(normalizedType)) {
    return res.status(400).json({ message: "type phải là excel hoặc pdf" });
  }

  const teacher = await User.findOne({ _id: teacherId, role: "Teacher" }).select(
    "_id fullName username",
  );
  if (!teacher) {
    return res.status(404).json({ message: "Không tìm thấy giáo viên" });
  }

  const from = new Date(parsed.y, parsed.m - 1, 1, 0, 0, 0, 0);
  const to = new Date(parsed.y, parsed.m, 0, 23, 59, 59, 999);

  const sessions = await TeachingLog.find({
    teacherId,
    date: { $gte: from, $lte: to },
  })
    .populate("classId", "className")
    .sort({ date: 1, startTime: 1 });

  const salarySessions = sessions.filter((item) => item.salary !== null && item.salary !== undefined);
  if (salarySessions.length === 0) {
    return res.status(400).json({
      message: "Không thể xuất phiếu lương khi chưa có salary cho tháng này",
    });
  }

  const totalSessions = salarySessions.length;
  const totalHours = Number(
    salarySessions
      .reduce((sum, item) => sum + (Number(item.durationHours) || 0), 0)
      .toFixed(2),
  );
  const totalSalary = salarySessions.reduce(
    (sum, item) => sum + (Number(item.salary) || 0),
    0,
  );

  const teacherName = teacher.fullName || teacher.username || "Teacher";
  const generatedBy = req.user?.fullName || req.user?.username || "Admin";
  const generatedAt = new Date();
  const baseFile = `Payslip_${sanitizeFilename(teacherName)}_${parsed.m}_${parsed.y}`;

  if (normalizedType === "excel") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Payslip");

    sheet.columns = [
      { header: "Date", key: "date", width: 14 },
      { header: "Class name", key: "className", width: 24 },
      { header: "Start time", key: "startTime", width: 12 },
      { header: "End time", key: "endTime", width: 12 },
      { header: "Total hours", key: "durationHours", width: 12 },
      { header: "Salary/session", key: "salary", width: 16 },
    ];

    sheet.mergeCells("A1:F1");
    sheet.getCell("A1").value = "Z CHESS CENTER";
    sheet.getCell("A1").font = { bold: true, size: 16 };
    sheet.getCell("A1").alignment = { horizontal: "center" };

    sheet.mergeCells("A2:F2");
    sheet.getCell("A2").value = `PAYSLIP - ${parsed.m}/${parsed.y}`;
    sheet.getCell("A2").font = { bold: true, size: 13 };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    sheet.getCell("A4").value = "Teacher";
    sheet.getCell("B4").value = teacherName;
    sheet.getCell("D4").value = "Generated at";
    sheet.getCell("E4").value = generatedAt.toLocaleString("vi-VN");

    sheet.getCell("A5").value = "Generated by";
    sheet.getCell("B5").value = generatedBy;

    const tableHeaderRow = 7;
    const headers = ["Date", "Class name", "Start time", "End time", "Total hours", "Salary/session"];
    headers.forEach((label, idx) => {
      const cell = sheet.getCell(tableHeaderRow, idx + 1);
      cell.value = label;
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE2E8F0" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    salarySessions.forEach((item, index) => {
      const row = sheet.getRow(tableHeaderRow + 1 + index);
      row.getCell(1).value = new Date(item.date).toLocaleDateString("vi-VN");
      row.getCell(2).value = item.classId?.className || "";
      row.getCell(3).value = item.startTime || "";
      row.getCell(4).value = item.endTime || "";
      row.getCell(5).value = Number(item.durationHours || 0);
      row.getCell(6).value = Number(item.salary || 0);
      [1, 2, 3, 4, 5, 6].forEach((col) => {
        row.getCell(col).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    const summaryStart = tableHeaderRow + 2 + salarySessions.length;
    sheet.getCell(`A${summaryStart}`).value = "Total sessions";
    sheet.getCell(`B${summaryStart}`).value = totalSessions;
    sheet.getCell(`A${summaryStart + 1}`).value = "Total hours";
    sheet.getCell(`B${summaryStart + 1}`).value = totalHours;
    sheet.getCell(`A${summaryStart + 2}`).value = "Total salary";
    sheet.getCell(`B${summaryStart + 2}`).value = totalSalary;
    sheet.getCell(`A${summaryStart + 2}`).font = { bold: true };
    sheet.getCell(`B${summaryStart + 2}`).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${baseFile}.xlsx"`);
    return res.send(Buffer.from(buffer));
  }

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const stream = new PassThrough();
  const chunks = [];

  stream.on("data", (chunk) => chunks.push(chunk));
  stream.on("end", () => {
    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${baseFile}.pdf"`);
    res.send(pdfBuffer);
  });

  doc.pipe(stream);

  doc.fontSize(16).text("Z CHESS CENTER", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(13).text(`PAYSLIP - ${parsed.m}/${parsed.y}`, { align: "center" });
  doc.moveDown();
  doc.fontSize(10).text(`Teacher: ${teacherName}`);
  doc.text(`Generated by: ${generatedBy}`);
  doc.text(`Generated at: ${generatedAt.toLocaleString("vi-VN")}`);
  doc.moveDown();

  const tableTop = doc.y;
  const colX = [40, 100, 240, 300, 360, 430];
  doc.fontSize(10).font("Helvetica-Bold");
  ["Date", "Class", "Start", "End", "Hours", "Salary"].forEach((h, idx) => {
    doc.text(h, colX[idx], tableTop, { width: idx === 1 ? 130 : 60 });
  });
  doc.moveTo(40, tableTop + 15).lineTo(555, tableTop + 15).stroke();

  doc.font("Helvetica");
  let y = tableTop + 20;
  salarySessions.forEach((item) => {
    if (y > 740) {
      doc.addPage();
      y = 60;
    }
    doc.text(new Date(item.date).toLocaleDateString("vi-VN"), colX[0], y, { width: 55 });
    doc.text(item.classId?.className || "", colX[1], y, { width: 130 });
    doc.text(item.startTime || "", colX[2], y, { width: 55 });
    doc.text(item.endTime || "", colX[3], y, { width: 55 });
    doc.text(String(item.durationHours || 0), colX[4], y, { width: 55 });
    doc.text(String(item.salary || 0), colX[5], y, { width: 100 });
    y += 18;
  });

  doc.moveDown();
  doc.font("Helvetica-Bold");
  doc.text(`Total sessions: ${totalSessions}`);
  doc.text(`Total hours: ${totalHours}`);
  doc.text(`Total salary: ${totalSalary}`);

  doc.end();
});
