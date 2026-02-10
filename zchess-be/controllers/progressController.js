const Progress = require("../models/Progress");
const Student = require("../models/Student");
const Class = require("../models/Class");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, VerticalAlign } = require("docx");

// Helper to create a table cell
const createCell = (text, width = 2500, bold = false, alignment = AlignmentType.LEFT) => {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    children: [
        new Paragraph({ 
            children: [new TextRun({ text: text || "", bold: bold })],
            alignment: alignment
        })
    ],
  });
};

// Get Progress by Student & Class
exports.getProgress = async (req, res) => {
    try {
        const { studentId, classId } = req.params;
        const progress = await Progress.findOne({ studentId, classId })
            .populate("sessions.attendanceId"); // Populate for dates
        res.json(progress); // Returns null if not found, handled by frontend
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create or Update Progress
exports.saveProgress = async (req, res) => {
    try {
        const { studentId, classId, sessions, teacherFeedback } = req.body;
        
        let progress = await Progress.findOne({ studentId, classId });
        if (progress) {
            // Update
            progress.sessions = sessions;
            progress.teacherFeedback = teacherFeedback;
            progress.updatedAt = Date.now();
            await progress.save();
        } else {
            // Create
            progress = new Progress({
                studentId,
                classId,
                sessions,
                teacherFeedback
            });
            await progress.save();
        }
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Progress
exports.deleteProgress = async (req, res) => {
    try {
        const { studentId, classId } = req.params;
        const result = await Progress.findOneAndDelete({ studentId, classId });
        if (!result) {
            return res.status(404).json({ message: "Phiếu học tập không tồn tại" });
        }
        res.json({ message: "Đã xóa phiếu học tập" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.exportProgressReport = async (req, res) => {
  try {
    const { studentId, classId } = req.params;

    // Fetch Progress
    const progress = await Progress.findOne({ studentId, classId })
      .populate("studentId")
      .populate({
          path: "classId",
          populate: { path: "teacherId", select: "fullName" } // Get Teacher Name
      })
      .populate({
        path: "sessions.attendanceId",
        select: "date",
      });

    if (!progress) {
      return res.status(404).json({ message: "Progress record not found" });
    }

    const student = progress.studentId;
    const classInfo = progress.classId;
    const teacherName = classInfo.teacherId ? classInfo.teacherId.fullName : "Unknown";

    // Chunk sessions into groups of 4
    const chunkSize = 4;
    const sessionChunks = [];
    for (let i = 0; i < progress.sessions.length; i += chunkSize) {
      sessionChunks.push(progress.sessions.slice(i, i + chunkSize));
    }

    // Create Table Rows
    const tableRows = [];
    
    sessionChunks.forEach((chunk, chunkIndex) => {
        // Row 1: Headers (BUỔI X: Date)
        const headerCells = [];
        // Row 2: Content (NỘI DUNG HỌC) + Content Cells
        // Note: The image shows "NỘI DUNG HỌC" as a label on the left? 
        // Actually the image shows a simple grid:
        // BUOI 1 | BUOI 2 | BUOI 3 | BUOI 4
        // Content1| Content2| Content3| Content4
        // So we just need 4 columns.
        
        // Wait, looking closer at the image (mentally, based on description), it seems to be just 4 columns.
        // Let's stick to the 4 columns per row.
        
        const contentCells = [];

        for (let i = 0; i < chunkSize; i++) {
            const session = chunk[i];
            if (session) {
                const sessionIndex = chunkIndex * chunkSize + i + 1;
                const dateStr = session.attendanceId ? new Date(session.attendanceId.date).toLocaleDateString("vi-VN") : "N/A";
                
                headerCells.push(createCell(`BUỔI ${sessionIndex}:\n${dateStr}`, 2500, true, AlignmentType.LEFT));
                contentCells.push(createCell(session.content || "", 2500));
            } else {
                // Empty cells filler
                headerCells.push(createCell("", 2500));
                contentCells.push(createCell("", 2500));
            }
        }
        
        tableRows.push(new TableRow({ children: headerCells }));
        
        // Check if there is a specific label column required?
        // User said: "Phieu hoc tap se o dang bang kieu nhu hinh"
        // The image usually implies:
        // [Label "NOI DUNG HOC"] [Content 1] [Content 2] ...
        // BUT the user's specific request "Grid layout 4 columns" might simplify it.
        // Let's assume standard grid first. If user wants row header, I'd need complex merging.
        // The prompt says "giong nhu hinh" (like the image).
        // Let's re-read the OCR.
        // "NOI DUNG HOC" is in the first column?
        // Ah, looking at the OCR text provided previously:
        // | | BUOI 1 | BUOI 2 | BUOI 3 | BUOI 4 |
        // | NOI DUNG | Content | Content | ...
        // This implies a 5-column layout OR the "NOI DUNG" is a merged cell?
        // Actually, looking at standard reports, usually it's just the grid. 
        // However, if the user provided an image with "NOI DUNG HOC" explicitly, I should try to support it.
        // Let's assume the user wants:
        // Row 1: [Empty] | Buoi 1 | Buoi 2 | Buoi 3 | Buoi 4
        // Row 2: [NOI DUNG] | C1 | C2 | C3 | C4
        
        // Let's modify logic to include a Label Column.
        // Col 1: Label (Width 1500), Cols 2-5: Session Data (Width 2000)
        
        // Row 1: Header
        const row1Cells = [createCell("", 1500)]; // Corner cell
        for (let i = 0; i < chunkSize; i++) {
             const session = chunk[i];
             const sessionIndex = chunkIndex * chunkSize + i + 1;
             const dateStr = session ? (session.attendanceId ? new Date(session.attendanceId.date).toLocaleDateString("vi-VN") : "N/A") : "";
             const text = session ? `BUỔI ${sessionIndex}:\n${dateStr}` : "";
             row1Cells.push(createCell(text, 2000, true));
        }
        // Fill remaining
        while(row1Cells.length < 5) row1Cells.push(createCell("", 2000));
        tableRows.push(new TableRow({ children: row1Cells }));

        // Row 2: Content
        const row2Cells = [createCell("NỘI DUNG HỌC", 1500, true)];
        for (let i = 0; i < chunkSize; i++) {
             const session = chunk[i];
             row2Cells.push(createCell(session ? (session.content || "") : "", 2000));
        }
        while(row2Cells.length < 5) row2Cells.push(createCell("", 2000));
        tableRows.push(new TableRow({ children: row2Cells }));
    });


    // Create Document
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
                  size: 32, // 16pt
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),

            // Info Block (Right aligned as per image suggestion usually, but let's keep it simple)
            new Paragraph({
              children: [new TextRun({ text: `Lịch học: ${classInfo.schedule || ""}`, bold: true })],
              alignment: AlignmentType.RIGHT,
            }),
            new Paragraph({
                children: [new TextRun({ text: `Ca học: ${classInfo.schedule ? classInfo.schedule.split(" ")[1] : ""}`, bold: true })], // Simple hack, real data might need parsing
                alignment: AlignmentType.RIGHT,
            }),
             new Paragraph({
                children: [new TextRun({ text: `GVHD: ${teacherName}`, bold: true })],
                alignment: AlignmentType.RIGHT,
            }),
             new Paragraph({ text: "" }),

             new Paragraph({
              children: [
                new TextRun({ text: `Học sinh: ${student.fullName}`, bold: true, size: 24 }),
              ],
            }),
            new Paragraph({ text: "" }),

            // The MAIN TABLE
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
             new Paragraph({ text: "" }),

            // Teacher Feedback (Bottom)
            new Paragraph({
                children: [
                    new TextRun({ text: "ĐÁNH GIÁ CỦA GIÁO VIÊN", bold: true, size: 28 })
                ]
            }),
             new Paragraph({
                children: [
                    new TextRun({ text: "- Ưu điểm: ", bold: true }),
                    new TextRun(progress.teacherFeedback?.strengths || "")
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "- Nhược điểm: ", bold: true }),
                    new TextRun(progress.teacherFeedback?.weaknesses || "")
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "- Hướng khắc phục: ", bold: true }),
                    new TextRun(progress.teacherFeedback?.improvementPlan || "")
                ]
            }),
          ],
        },
      ],
    });

    // Generate and Send
    const buffer = await Packer.toBuffer(doc);
    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=PhieuHocTap_${student.fullName}.docx`
    );
    res.send(buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating report" });
  }
};
