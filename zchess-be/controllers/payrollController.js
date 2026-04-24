const asyncHandler = require("../middleware/asyncHandler");
const TeachingLog = require("../models/TeachingLog");
const Class = require("../models/Class");
const User = require("../models/User");
const Setting = require("../models/Setting");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const fs = require("fs");
const path = require("path");

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

const formatNumberVi = (value) =>
  Number(value || 0).toLocaleString("vi-VN");

const pickFirstExistingPath = (paths = []) =>
  paths.find((candidate) => candidate && fs.existsSync(candidate)) || null;

const resolvePayrollPdfFonts = () => {
  const customRegular = process.env.PAYSLIP_FONT_REGULAR_PATH;
  const customBold = process.env.PAYSLIP_FONT_BOLD_PATH;

  const regularCandidates = [
    customRegular,
    path.resolve(process.cwd(), "assets/fonts/NotoSans-Regular.ttf"),
    path.resolve(process.cwd(), "fonts/NotoSans-Regular.ttf"),
    "C:/Windows/Fonts/arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
  ];
  const boldCandidates = [
    customBold,
    path.resolve(process.cwd(), "assets/fonts/NotoSans-Bold.ttf"),
    path.resolve(process.cwd(), "fonts/NotoSans-Bold.ttf"),
    "C:/Windows/Fonts/arialbd.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
  ];

  const regular = pickFirstExistingPath(regularCandidates);
  const bold = pickFirstExistingPath(boldCandidates) || regular;

  return { regular, bold };
};

const resolveLogoLocalPath = (logoUrl) => {
  const raw = String(logoUrl || "").trim();
  if (!raw) return null;
  if (path.isAbsolute(raw) && fs.existsSync(raw)) return raw;
  let uploadRelativePath = "";
  if (raw.startsWith("/uploads/")) {
    uploadRelativePath = raw.replace("/uploads/", "");
  } else if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (parsed.pathname.startsWith("/uploads/")) {
        uploadRelativePath = parsed.pathname.replace("/uploads/", "");
      }
    } catch {
      // ignore URL parse error
    }
  }
  if (uploadRelativePath) {
    const localUploadPath = path.resolve(__dirname, "../uploads", uploadRelativePath);
    if (fs.existsSync(localUploadPath)) return localUploadPath;
  }
  const maybeRelative = path.resolve(process.cwd(), raw.replace(/^\/+/, ""));
  if (fs.existsSync(maybeRelative)) return maybeRelative;
  return null;
};

exports.createTeacherSession = asyncHandler(async (req, res) => {
  const classId = req.body.class_id || req.body.classId;
  const date = req.body.date;
  const startTime = req.body.start_time || req.body.startTime;
  const endTime = req.body.end_time || req.body.endTime;
  const note = req.body.note || "";

  if (req.body.salary !== undefined) {
    return res
      .status(400)
      .json({ message: "Teacher không được phép nhập lương" });
  }
  if (!classId || !date || !startTime || !endTime) {
    return res.status(400).json({ message: "Thiếu thông tin ca dạy bắt buộc" });
  }

  const ownClass = await Class.exists({
    _id: classId,
    teacherId: req.user._id,
  });
  if (!ownClass) {
    return res
      .status(403)
      .json({ message: "Bạn chỉ được tạo ca dạy cho lớp của mình" });
  }

  const durationHours = computeDurationHours(startTime, endTime);
  if (!durationHours || durationHours <= 0) {
    return res
      .status(400)
      .json({ message: "start_time / end_time không hợp lệ" });
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
  const {
    teacherId,
    classId,
    date,
    startTime,
    endTime,
    note = "",
    salary,
  } = req.body || {};
  if (!teacherId || !classId || !date || !startTime || !endTime) {
    return res.status(400).json({
      message: "Thiếu teacherId, classId, date, startTime hoặc endTime",
    });
  }

  const teacher = await User.findOne({
    _id: teacherId,
    role: "Teacher",
  }).select("_id");
  if (!teacher) {
    return res.status(404).json({ message: "Không tìm thấy giáo viên" });
  }
  const classDoc = await Class.findById(classId).select("_id teacherId");
  if (!classDoc) {
    return res.status(404).json({ message: "Không tìm thấy lớp học" });
  }
  if (String(classDoc.teacherId) !== String(teacherId)) {
    return res
      .status(400)
      .json({ message: "Lớp học không thuộc giáo viên đã chọn" });
  }

  const durationHours = computeDurationHours(startTime, endTime);
  if (!durationHours || durationHours <= 0) {
    return res
      .status(400)
      .json({ message: "startTime / endTime không hợp lệ" });
  }

  const normalizedSalary =
    salary === undefined || salary === null || salary === ""
      ? null
      : Number(salary);
  if (
    normalizedSalary !== null &&
    (!Number.isFinite(normalizedSalary) || normalizedSalary < 0)
  ) {
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
  const teacher = await User.findOne({
    _id: teacherId,
    role: "Teacher",
  }).select("_id fullName username email phone");
  if (!teacher) {
    return res.status(404).json({ message: "Không tìm thấy giáo viên" });
  }

  const sessions = await TeachingLog.find({ teacherId })
    .populate("classId", "className schedule")
    .sort({ date: -1, createdAt: -1 });

  const totalSalary = sessions.reduce(
    (sum, item) => sum + (item.salary || 0),
    0,
  );
  const totalHours = sessions.reduce(
    (sum, item) => sum + (item.durationHours || 0),
    0,
  );

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
    return res
      .status(400)
      .json({ message: "Thiếu teacherId, month hoặc year" });
  }

  const parsed = parseMonthYear(month, year);
  if (!parsed) {
    return res.status(400).json({ message: "month/year không hợp lệ" });
  }
  const normalizedType = String(type).toLowerCase();
  if (!["excel", "pdf"].includes(normalizedType)) {
    return res.status(400).json({ message: "type phải là excel hoặc pdf" });
  }

  const teacher = await User.findOne({
    _id: teacherId,
    role: "Teacher",
  }).select("_id fullName username");
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

  const salarySessions = sessions.filter(
    (item) => item.salary !== null && item.salary !== undefined,
  );
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
  const settings = await Setting.findOne({ singletonKey: "system" }).select(
    "centerName logoUrl",
  );
  const centerName = settings?.centerName || "TRUNG TÂM Z CHESS";
  const logoPath =
    resolveLogoLocalPath(settings?.logoUrl) ||
    pickFirstExistingPath([
      process.env.PAYSLIP_LOGO_PATH,
      path.resolve(process.cwd(), "assets/logo.png"),
      path.resolve(process.cwd(), "assets/logo.jpg"),
      path.resolve(process.cwd(), "assets/logo.jpeg"),
    ]);

  if (normalizedType === "excel") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Payslip");

    sheet.columns = [
      { header: "Ngày", key: "date", width: 14 },
      { header: "Tên lớp", key: "className", width: 24 },
      { header: "Giờ bắt đầu", key: "startTime", width: 12 },
      { header: "Giờ kết thúc", key: "endTime", width: 12 },
      { header: "Tổng giờ", key: "durationHours", width: 12 },
      { header: "Lương/ca", key: "salary", width: 16 },
    ];

    if (logoPath) {
      const extension = path.extname(logoPath).toLowerCase().includes("png")
        ? "png"
        : "jpeg";
      const imageId = workbook.addImage({
        filename: logoPath,
        extension,
      });
      sheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 72, height: 72 },
      });
    }

    sheet.mergeCells("A1:F1");
    sheet.getCell("A1").value = centerName.toUpperCase();
    sheet.getCell("A1").font = { bold: true, size: 16 };
    sheet.getCell("A1").alignment = { horizontal: "center" };

    sheet.mergeCells("A2:F2");
    sheet.getCell("A2").value = `PHIẾU LƯƠNG - ${parsed.m}/${parsed.y}`;
    sheet.getCell("A2").font = { bold: true, size: 13 };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    sheet.getCell("A4").value = "Giáo viên";
    sheet.getCell("B4").value = teacherName;
    sheet.getCell("D4").value = "Ngày tạo";
    sheet.getCell("E4").value = generatedAt.toLocaleString("vi-VN");

    sheet.getCell("A5").value = "Người tạo";
    sheet.getCell("B5").value = generatedBy;

    const tableHeaderRow = 7;
    const headers = [
      "Ngày",
      "Tên lớp",
      "Giờ bắt đầu",
      "Giờ kết thúc",
      "Tổng giờ",
      "Lương/ca",
    ];
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
    sheet.getCell(`A${summaryStart}`).value = "Tổng số ca";
    sheet.getCell(`B${summaryStart}`).value = totalSessions;
    sheet.getCell(`A${summaryStart + 1}`).value = "Tổng số giờ";
    sheet.getCell(`B${summaryStart + 1}`).value = totalHours;
    sheet.getCell(`A${summaryStart + 2}`).value = "Tổng số lương";
    sheet.getCell(`B${summaryStart + 2}`).value = formatNumberVi(totalSalary);
    sheet.getCell(`A${summaryStart + 2}`).font = { bold: true };
    sheet.getCell(`B${summaryStart + 2}`).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${baseFile}.xlsx"`,
    );
    return res.send(Buffer.from(buffer));
  }

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const fonts = resolvePayrollPdfFonts();
  const stream = new PassThrough();
  const chunks = [];

  stream.on("data", (chunk) => chunks.push(chunk));
  stream.on("end", () => {
    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${baseFile}.pdf"`,
    );
    res.send(pdfBuffer);
  });

  doc.pipe(stream);
  const useUnicodeFonts = Boolean(fonts.regular && fonts.bold);
  if (useUnicodeFonts) {
    doc.registerFont("PayrollRegular", fonts.regular);
    doc.registerFont("PayrollBold", fonts.bold);
  }
  const setRegularFont = () =>
    doc.font(useUnicodeFonts ? "PayrollRegular" : "Helvetica");
  const setBoldFont = () =>
    doc.font(useUnicodeFonts ? "PayrollBold" : "Helvetica-Bold");

  if (logoPath) {
    try {
      doc.image(logoPath, 40, 36, { fit: [54, 54] });
    } catch {
      // Ignore logo draw failure, keep exporting text content.
    }
  }

  setBoldFont();
  doc.fontSize(16).text(centerName.toUpperCase(), { align: "center" });
  doc.moveDown(0.3);
  doc
    .fontSize(13)
    .text(`PHIẾU LƯƠNG - ${parsed.m}/${parsed.y}`, { align: "center" });
  doc.moveDown();
  setRegularFont();
  doc.fontSize(10).text(`Giáo viên: ${teacherName}`);
  doc.text(`Người tạo: ${generatedBy}`);
  doc.text(`Ngày tạo: ${generatedAt.toLocaleString("vi-VN")}`);
  doc.moveDown();

  const tableTop = doc.y;
  const colX = [40, 100, 240, 300, 360, 430];
  setBoldFont();
  doc.fontSize(10);
  [
    "Ngày",
    "Tên lớp",
    "Giờ bắt đầu",
    "Giờ kết thúc",
    "Tổng giờ",
    "Lương/ca",
  ].forEach((h, idx) => {
    doc.text(h, colX[idx], tableTop, { width: idx === 1 ? 130 : 60 });
  });
  doc
    .moveTo(40, tableTop + 15)
    .lineTo(555, tableTop + 15)
    .stroke();

  setRegularFont();
  let y = tableTop + 20;
  salarySessions.forEach((item) => {
    if (y > 740) {
      doc.addPage();
      y = 60;
    }
    doc.text(new Date(item.date).toLocaleDateString("vi-VN"), colX[0], y, {
      width: 55,
    });
    doc.text(item.classId?.className || "", colX[1], y, { width: 130 });
    doc.text(item.startTime || "", colX[2], y, { width: 55 });
    doc.text(item.endTime || "", colX[3], y, { width: 55 });
    doc.text(String(item.durationHours || 0), colX[4], y, { width: 55 });
    doc.text(String(item.salary || 0), colX[5], y, { width: 100 });
    y += 18;
  });

  doc.moveDown();
  setBoldFont();
  doc.text(`Tổng số ca: ${totalSessions}`);
  doc.text(`Tổng số giờ: ${totalHours}`);
  doc.text(`Tổng số lương: ${formatNumberVi(totalSalary)}`);

  doc.end();
});
