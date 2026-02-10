require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const cookieParser = require("cookie-parser");

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

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes); // Auth first
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/posts", postRoutes);
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

const PORT = process.env.PORT || 5000;

console.log("Mongo URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
