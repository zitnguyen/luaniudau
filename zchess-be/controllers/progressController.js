const Progress = require("../models/Progress");
const Class = require("../models/Class");
const asyncHandler = require("../middleware/asyncHandler");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  VerticalAlign,
} = require("docx");

const createCell = (
  text,
  width = 2500,
  bold = false,
  alignment = AlignmentType.LEFT,
) => {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        children: [new TextRun({ text: text || "", bold: bold })],
        alignment: alignment,
      }),
    ],
  });
};

const sanitizeFilename = (value) =>
  (value || "Student")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");

const ensureTeacherCanAccessStudentInClass = async ({
  teacherId,
  classId,
  studentId,
}) => {
  const ownClass = await Class.exists({
    _id: classId,
    teacherId,
    studentIds: { $in: [studentId] },
  });
  return Boolean(ownClass);
};

exports.getProgress = asyncHandler(async (req, res) => {
  const { studentId, classId } = req.params;
  if (req.user?.role === "Teacher") {
    const allowed = await ensureTeacherCanAccessStudentInClass({
      teacherId: req.user._id,
      classId,
      studentId,
    });
    if (!allowed) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  const progress = await Progress.findOne({ studentId, classId }).populate(
    "sessions.attendanceId",
  );
  res.json(progress);
});

exports.saveProgress = asyncHandler(async (req, res) => {
  const { studentId, classId, sessions, teacherFeedback } = req.body;
  if (req.user?.role === "Teacher") {
    const allowed = await ensureTeacherCanAccessStudentInClass({
      teacherId: req.user._id,
      classId,
      studentId,
    });
    if (!allowed) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  const classDoc = await Class.findById(classId).select("teacherId");
  const resolvedTeacherId =
    req.user?.role === "Teacher" ? req.user._id : classDoc?.teacherId || null;

  let progress = await Progress.findOne({ studentId, classId });
  if (progress) {
    progress.sessions = sessions;
    progress.teacherFeedback = teacherFeedback;
    progress.teacherId = resolvedTeacherId;
    progress.updatedAt = Date.now();
    await progress.save();
  } else {
    progress = new Progress({
      studentId,
      classId,
      teacherId: resolvedTeacherId,
      sessions,
      teacherFeedback,
    });
    await progress.save();
  }
  res.json(progress);
});

exports.deleteProgress = asyncHandler(async (req, res) => {
  const { studentId, classId } = req.params;
  if (req.user?.role === "Teacher") {
    const allowed = await ensureTeacherCanAccessStudentInClass({
      teacherId: req.user._id,
      classId,
      studentId,
    });
    if (!allowed) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  const result = await Progress.findOneAndDelete({ studentId, classId });
  if (!result) {
    return res.status(404).json({ message: "Phiếu học tập không tồn tại" });
  }
  res.json({ message: "Đã xóa phiếu học tập" });
});

exports.exportProgressReport = asyncHandler(async (req, res) => {
  const { studentId, classId } = req.params;
  if (req.user?.role === "Teacher") {
    const allowed = await ensureTeacherCanAccessStudentInClass({
      teacherId: req.user._id,
      classId,
      studentId,
    });
    if (!allowed) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const progress = await Progress.findOne({ studentId, classId })
    .populate("studentId")
    .populate({
      path: "classId",
      populate: { path: "teacherId", select: "fullName" },
    })
    .populate("teacherId", "fullName username")
    .populate({
      path: "sessions.attendanceId",
      select: "date",
    });

  if (!progress) {
    return res.status(404).json({ message: "Progress record not found" });
  }

  const student = progress.studentId || {};
  const classInfo = progress.classId || {};
  const teacherName =
    progress.teacherId?.fullName ||
    classInfo.teacherId?.fullName ||
    req.user?.fullName ||
    "Unknown";

  const chunkSize = 4;
  const sessionChunks = [];
  for (let i = 0; i < progress.sessions.length; i += chunkSize) {
    sessionChunks.push(progress.sessions.slice(i, i + chunkSize));
  }

  const tableRows = [];

  sessionChunks.forEach((chunk, chunkIndex) => {
    const row1Cells = [createCell("", 1500)];
    for (let i = 0; i < chunkSize; i++) {
      const session = chunk[i];
      const sessionIndex = chunkIndex * chunkSize + i + 1;
      const dateValue = session?.attendanceId?.date;
      const dateStr = dateValue
        ? new Date(dateValue).toLocaleDateString("vi-VN")
        : "N/A";
      const text = session ? `BUỔI ${sessionIndex}:\n${dateStr}` : "";
      row1Cells.push(createCell(text, 2000, true));
    }
    while (row1Cells.length < 5) row1Cells.push(createCell("", 2000));
    tableRows.push(new TableRow({ children: row1Cells }));

    const row2Cells = [createCell("NỘI DUNG HỌC", 1500, true)];
    for (let i = 0; i < chunkSize; i++) {
      const session = chunk[i];
      row2Cells.push(
        createCell(session ? session.content || "" : "", 2000),
      );
    }
    while (row2Cells.length < 5) row2Cells.push(createCell("", 2000));
    tableRows.push(new TableRow({ children: row2Cells }));
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "PHIẾU HỌC TẬP / LEARNING PROGRESS ROLL",
                bold: true,
                size: 32,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Lịch học: ${classInfo.schedule || ""}`,
                bold: true,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Ca học: ${classInfo.schedule ? classInfo.schedule.split(" ")[1] : ""}`,
                bold: true,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `GVHD: ${teacherName}`, bold: true }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Học sinh: ${student.fullName || "Deleted Student"}`,
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Lớp: ${classInfo.className || "N/A"}`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Ngày tạo phiếu: ${new Date(progress.createdAt || Date.now()).toLocaleDateString("vi-VN")}`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "ĐÁNH GIÁ CỦA GIÁO VIÊN",
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Ưu điểm: ", bold: true }),
              new TextRun(progress.teacherFeedback?.strengths || ""),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Nhược điểm: ", bold: true }),
              new TextRun(progress.teacherFeedback?.weaknesses || ""),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Hướng khắc phục: ", bold: true }),
              new TextRun(progress.teacherFeedback?.improvementPlan || ""),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  const rawStudentName = student?.fullName || "Student";
  const asciiFilename = `PhieuHocTap_${sanitizeFilename(rawStudentName)}.docx`;
  const utf8Filename = encodeURIComponent(`PhieuHocTap_${rawStudentName}.docx`);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${asciiFilename}"; filename*=UTF-8''${utf8Filename}`,
  );
  res.send(buffer);
});
