/**
 * Express application wiring (split from `server.js`, following zlss layout).
 * DB connection and process listen stay in `server.js`.
 */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const hpp = require("hpp");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const postRoutes = require("./routes/postRoutes");
const studentRoutes = require("./routes/studentRoutes");
const classRoutes = require("./routes/classRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const parentRoutes = require("./routes/parentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const progressRoutes = require("./routes/progressRoutes");
const financeRoutes = require("./routes/financeRoutes");
const revenueRoutes = require("./routes/revenueRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const assessmentStubRoutes = require("./routes/assessmentStubRoutes");
const teachingLogStubRoutes = require("./routes/teachingLogStubRoutes");
const leadRoutes = require("./routes/leadRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminPayrollRoutes = require("./routes/adminPayrollRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const heroSettingRoutes = require("./routes/heroSettingRoutes");
const lichessRoutes = require("./routes/lichessRoutes");
const chatRoutes = require("./routes/chatRoutes");

const errorHandler = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./middleware/securityMiddleware");
const requestSanitizer = require("./middleware/requestSanitizerMiddleware");

const app = express();
app.disable("x-powered-by");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      process.env.CLIENT_URL || "http://localhost:3000",
    ],
    credentials: true,
  }),
);

app.use(
  helmet({
    // Allow frontend on another local origin (5173) to render uploaded images.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(apiLimiter);
app.use(express.json());
app.use(cookieParser());
app.use(requestSanitizer);
app.use(hpp());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/news", postRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/assessments", assessmentStubRoutes);
app.use("/api/teaching-logs", teachingLogStubRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/admin", adminPayrollRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/hero-settings", heroSettingRoutes);
app.use("/api/lichess", lichessRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

module.exports = app;
