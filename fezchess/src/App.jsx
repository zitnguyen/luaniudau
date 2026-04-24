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
import StudentDetail from "./pages/Admin/Students/StudentDetail";
import ClassList from "./pages/Admin/Classes/ClassList";
import ClassForm from "./pages/Admin/Classes/ClassForm";
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
import TestimonialList from "./pages/Admin/CMS/TestimonialList";
import TestimonialForm from "./pages/Admin/CMS/TestimonialForm";
import HeroSettingForm from "./pages/Admin/CMS/HeroSettingForm";
import InquiryList from "./pages/Admin/CRM/InquiryList";
import AdminCourseList from "./pages/Admin/Courses/AdminCourseList";
import AdminCourseForm from "./pages/Admin/Courses/AdminCourseForm";
import AdminNotificationCreate from "./pages/Admin/Notifications/AdminNotificationCreate";
import AdminPayroll from "./pages/Admin/Payroll/AdminPayroll";
import SystemSettings from "./pages/Admin/Settings/SystemSettings";

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
import TeacherClassList from "./pages/portal/Teacher/Classes/TeacherClassList";
import TeacherClassDetail from "./pages/portal/Teacher/Classes/TeacherClassDetail";
import TeacherAttendance from "./pages/portal/Teacher/Attendance/TeacherAttendance";
import TeacherSchedule from "./pages/portal/Teacher/Schedule/TeacherSchedule";
import TeacherSettings from "./pages/portal/Teacher/Settings/TeacherSettings";

import StudentDashboard from "./pages/portal/Student/Dashboard/StudentDashboard";
import StudentSchedule from "./pages/portal/Student/Schedule/StudentSchedule";
import StudentProfile from "./pages/portal/Student/Profile/StudentProfile";
import MyCourses from "./pages/portal/Student/MyCourses";
import NotificationListPage from "./pages/shared/Notifications/NotificationListPage";
import NotificationDetailPage from "./pages/shared/Notifications/NotificationDetailPage";
import ChatPage from "./pages/shared/Chat/ChatPage";

// Auth & Public
import Login from "./pages/auth/Login/Login";
import Signup from "./pages/auth/Signup/Signup";
import HomePage from "./pages/public/HomePage";
import NewsPage from "./pages/public/NewsPage";
import PostDetail from "./pages/public/PostDetail";
import ContactPage from "./pages/public/ContactPage";
import TeacherPage from "./pages/public/TeacherPage";
import TeacherDetailPage from "./pages/public/TeacherDetailPage";
import LearningPage from "./pages/public/LearningPage";
import { Toaster } from "sonner";
import { SystemSettingsProvider } from "./context/SystemSettingsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PublicCmsProvider } from "./context/PublicCmsContext";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <SystemSettingsProvider>
          <PublicCmsProvider>
            <Toaster position="top-right" richColors closeButton />
            <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/test-register"
                element={<Navigate to="/contact" replace />}
              />
              <Route path="/courses" element={<CourseStorePage />} />
              <Route path="/courses/:slug" element={<CourseDetail />} />
              <Route
                path="/learning/:courseSlug/:lessonId"
                element={<LearningPage />}
              />

              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<PostDetail />} />
              <Route path="/teachers" element={<TeacherPage />} />
              <Route path="/teachers/:id" element={<TeacherDetailPage />} />
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
              path="/admin/teachers"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <TeacherList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers/new"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <TeacherForm />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <TeacherForm />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/students"
              element={<Navigate to="/students" replace />}
            />
            <Route
              path="/admin/students/create"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <StudentForm />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <StudentDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <StudentForm />
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
              path="/students/create"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <StudentForm />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <StudentDetail />
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
              path="/students/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <StudentForm />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/classes"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <ClassList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes/new"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <ClassForm />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <ClassForm />
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
                <ProtectedRoute allowedRoles={["Admin", "Teacher"]}>
                  <MainLayout>
                    <ProgressList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress/:studentId/:classId"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Teacher"]}>
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
              path="/cms/testimonials"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <TestimonialList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cms/testimonials/new"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <TestimonialForm />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cms/testimonials/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <TestimonialForm />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cms/hero"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <HeroSettingForm />
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

            <Route
              path="/admin/payroll"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <AdminPayroll />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <NotificationListPage basePath="/admin/notifications" />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <NotificationDetailPage basePath="/admin/notifications" />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications/new"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <AdminNotificationCreate />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <SystemSettings />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/chat"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <MainLayout>
                    <ChatPage />
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
                      <Route path="classes" element={<TeacherClassList />} />
                      <Route
                        path="classes/:classId"
                        element={<TeacherClassDetail />}
                      />
                      <Route
                        path="attendance"
                        element={<TeacherAttendance />}
                      />
                      <Route path="schedule" element={<TeacherSchedule />} />
                      <Route path="payroll" element={<TeachingLogList />} />
                      <Route path="assessments" element={<AssessmentList />} />
                      <Route path="settings" element={<TeacherSettings />} />
                      <Route path="chat" element={<ChatPage />} />
                      <Route
                        path="notifications"
                        element={
                          <NotificationListPage basePath="/teacher/notifications" />
                        }
                      />
                      <Route
                        path="notifications/:id"
                        element={
                          <NotificationDetailPage basePath="/teacher/notifications" />
                        }
                      />
                      <Route
                        path="*"
                        element={
                          <div className="p-10">Trang giáo viên đang được cập nhật</div>
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
                      <Route path="chat" element={<ChatPage />} />
                      <Route
                        path="notifications"
                        element={
                          <NotificationListPage basePath="/parent/notifications" />
                        }
                      />
                      <Route
                        path="notifications/:id"
                        element={
                          <NotificationDetailPage basePath="/parent/notifications" />
                        }
                      />
                      <Route
                        path="*"
                        element={
                          <div className="p-10">Trang phụ huynh đang được cập nhật</div>
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
                      <Route path="chat" element={<ChatPage />} />
                      <Route
                        path="notifications"
                        element={
                          <NotificationListPage basePath="/student/notifications" />
                        }
                      />
                      <Route
                        path="notifications/:id"
                        element={
                          <NotificationDetailPage basePath="/student/notifications" />
                        }
                      />
                      <Route
                        path="*"
                        element={
                          <div className="p-10">Trang học viên đang được cập nhật</div>
                        }
                      />
                    </Routes>
                  </StudentLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="*"
              element={<div className="p-20 text-center">Trang đang được cập nhật</div>}
            />
            </Routes>
          </PublicCmsProvider>
        </SystemSettingsProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
