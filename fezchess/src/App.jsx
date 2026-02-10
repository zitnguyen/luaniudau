import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Admin Pages
import Dashboard from "./pages/Admin/Dashboard/MainDashboard";
import TeacherList from "./pages/Admin/Teachers/TeacherList";
import TeacherForm from "./pages/Admin/Teachers/TeacherForm";
import StudentList from "./pages/Admin/Students/StudentList";
import StudentForm from "./pages/Admin/Students/StudentForm";
import Finance from "./pages/Admin/Finance/Finance";
import Attendance from "./pages/Admin/Attendance/Attendance";
import EnrollmentList from "./pages/Admin/Enrollments/EnrollmentList";
import EnrollmentForm from "./pages/Admin/Enrollments/EnrollmentForm";
import Schedule from "./pages/Admin/Schedule/Schedule";
import ParentList from "./pages/Admin/Parents/ParentList";
import ParentForm from "./pages/Admin/Parents/ParentForm";
import ProgressList from "./pages/Admin/Progress/ProgressList";
import ProgressDetail from "./pages/Admin/Progress/ProgressDetail";
import PostList from "./pages/Admin/CMS/PostList";
import PostForm from "./pages/Admin/CMS/PostForm";
import InquiryList from "./pages/Admin/CRM/InquiryList";
import AdminCourseList from "./pages/Admin/Courses/AdminCourseList";
import AdminCourseForm from "./pages/Admin/Courses/AdminCourseForm";

// Public Pages
import CourseStorePage from "./pages/public/CourseStorePage";
import CourseDetail from "./pages/public/CourseDetail";

// Layouts
import ParentLayout from "./layouts/ParentLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import StudentLayout from "./layouts/StudentLayout";
import PublicLayout from "./components/layout/PublicLayout"; // Using the component version

// Portal Pages
import ParentDashboard from "./pages/portal/Parent/ParentDashboard";
import ParentSchedule from "./pages/portal/Parent/ParentSchedule";

import TeacherDashboard from "./pages/portal/Teacher/Dashboard/TeacherDashboard";
import TeachingLogList from "./pages/portal/Teacher/Payroll/TeachingLogList";
import AssessmentList from "./pages/portal/Teacher/Assessment/AssessmentList";

import StudentDashboard from "./pages/portal/Student/Dashboard/StudentDashboard";
import StudentSchedule from "./pages/portal/Student/Schedule/StudentSchedule";
import StudentProfile from "./pages/portal/Student/Profile/StudentProfile";
import MyCourses from "./pages/portal/Student/MyCourses";

// Auth & Public
import Login from "./pages/auth/Login/Login";
import Signup from "./pages/auth/Signup/Signup";
import HomePage from "./pages/public/HomePage";
import TestRegisterPage from "./pages/public/TestRegisterPage";
import NewsPage from "./pages/public/NewsPage";
import PostDetail from "./pages/public/PostDetail";
import ContactPage from "./pages/public/ContactPage";
import TeacherPage from "./pages/public/TeacherPage";
import LearningPage from "./pages/public/LearningPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/test-register" element={<TestRegisterPage />} />
          <Route path="/courses" element={<CourseStorePage />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route
            path="/learning/:courseSlug/:lessonId"
            element={<LearningPage />}
          />

          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<PostDetail />} />
          <Route path="/teachers" element={<TeacherPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teachers"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <TeacherList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers/new"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <TeacherForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <TeacherForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <StudentList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/new"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <StudentForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <StudentForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/parents"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <ParentList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parents/new"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <ParentForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parents/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <ParentForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/enrollments"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <EnrollmentList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollments/new"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <EnrollmentForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollments/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <EnrollmentForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <Schedule />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <Attendance />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <Finance />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/progress"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <ProgressList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress/:studentId/:classId"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <ProgressDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* CMS & CRM */}
        <Route
          path="/cms/posts"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <PostList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/posts/new"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <PostForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/posts/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <PostForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/inquiries"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <InquiryList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Courses */}
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <AdminCourseList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses/new"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <AdminCourseForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout>
                <AdminCourseForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={<Navigate to="/teacher/dashboard" replace />}
        />
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute allowedRoles={["Teacher"]}>
              <TeacherLayout>
                <Routes>
                  <Route path="dashboard" element={<TeacherDashboard />} />
                  <Route path="payroll" element={<TeachingLogList />} />
                  <Route path="assessments" element={<AssessmentList />} />
                  <Route
                    path="*"
                    element={
                      <div className="p-10">Teacher Page Coming Soon</div>
                    }
                  />
                </Routes>
              </TeacherLayout>
            </ProtectedRoute>
          }
        />

        {/* Parent Routes */}
        <Route
          path="/parent"
          element={<Navigate to="/parent/dashboard" replace />}
        />
        <Route
          path="/parent/*"
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentLayout>
                <Routes>
                  <Route path="dashboard" element={<ParentDashboard />} />
                  <Route path="schedule" element={<ParentSchedule />} />
                  <Route
                    path="*"
                    element={
                      <div className="p-10">Parent Page Coming Soon</div>
                    }
                  />
                </Routes>
              </ParentLayout>
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={<Navigate to="/student/dashboard" replace />}
        />
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentLayout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="schedule" element={<StudentSchedule />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="courses" element={<MyCourses />} />
                  <Route
                    path="*"
                    element={
                      <div className="p-10">Student Page Coming Soon</div>
                    }
                  />
                </Routes>
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<div className="p-20 text-center">Coming Soon</div>}
        />
      </Routes>
    </Router>
  );
}

export default App;
