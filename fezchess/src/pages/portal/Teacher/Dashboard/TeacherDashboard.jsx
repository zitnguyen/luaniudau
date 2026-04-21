import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Calendar, Clock, Users } from "lucide-react";
import teacherDashboardService from "../../../../services/teacherDashboardService";

const TeacherDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({});
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [finance, setFinance] = useState({});

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const [dashboardRes, classesRes, studentsRes, attendanceRes, financeRes] =
          await Promise.allSettled([
            teacherDashboardService.getDashboard(),
            teacherDashboardService.getClasses(),
            teacherDashboardService.getStudents(),
            teacherDashboardService.getAttendance(),
            teacherDashboardService.getFinance(),
          ]);

        if (dashboardRes.status === "fulfilled") {
          setDashboardData(dashboardRes.value || {});
        } else {
          setDashboardData({});
        }
        setClasses(
          classesRes.status === "fulfilled" && Array.isArray(classesRes.value)
            ? classesRes.value
            : [],
        );
        setStudents(
          studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value)
            ? studentsRes.value
            : [],
        );
        setAttendance(
          attendanceRes.status === "fulfilled" && Array.isArray(attendanceRes.value)
            ? attendanceRes.value
            : [],
        );
        setFinance(
          financeRes.status === "fulfilled" && financeRes.value
            ? financeRes.value
            : {},
        );

        if (dashboardRes.status === "rejected") {
          setError("Không thể tải dữ liệu tổng quan giáo viên.");
        }
      } catch (e) {
        setError("Không thể tải dữ liệu dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const apiStats = dashboardData?.stats || {};
    return [
      {
        label: "Lớp đang dạy",
        value: apiStats.totalClasses ?? classes.length ?? 0,
        sub: "Theo phân công hiện tại",
        icon: BookOpen,
        color: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        label: "Tổng học viên",
        value:
          apiStats.totalStudents ??
          classes.reduce((sum, item) => sum + (item.currentStudents || 0), 0),
        sub: "Học viên theo lớp",
        icon: Users,
        color: "bg-purple-50",
        iconColor: "text-purple-600",
      },
      {
        label: "Lịch dạy hôm nay",
        value:
          apiStats.todaySchedulesCount ??
          (Array.isArray(dashboardData?.todaySchedule)
            ? dashboardData.todaySchedule.length
            : 0),
        sub: "Lớp có lịch trong ngày",
        icon: Calendar,
        color: "bg-orange-50",
        iconColor: "text-orange-600",
      },
      {
        label: "Buổi dạy đã chốt",
        value: finance.confirmedSessions ?? 0,
        sub: `${Number(finance.totalHours || 0).toFixed(1)} giờ`,
        icon: Clock,
        color: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
    ];
  }, [classes, dashboardData, finance]);

  const todaySchedule = Array.isArray(dashboardData?.todaySchedule)
    ? dashboardData.todaySchedule
    : [];
  const latestAttendance = Array.isArray(dashboardData?.latestAttendance)
    ? dashboardData.latestAttendance
    : attendance.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard giáo viên
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Xin chào {user?.fullName || "Giáo viên"}, đây là tổng quan lớp học hôm nay.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            key={stat.label}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color} ${stat.iconColor}`}>
                <stat.icon size={22} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? "--" : stat.value}
            </h3>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Lịch dạy hôm nay</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Đang tải lịch dạy...</div>
          ) : todaySchedule.length === 0 ? (
            <div className="text-sm text-gray-500">Không có lịch dạy hôm nay.</div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((item) => (
                <div
                  key={item._id}
                  className="border border-gray-100 rounded-xl p-3 bg-gray-50"
                >
                  <div className="font-semibold text-gray-900">
                    {item.className || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {item.schedule || "Chưa có lịch"} - {item.currentStudents || 0} học viên
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Thu nhập / buổi dạy</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Đang tải dữ liệu buổi dạy...</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tổng buổi dạy</span>
                <span className="font-semibold text-gray-900">
                  {finance.totalSessions ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tổng giờ dạy</span>
                <span className="font-semibold text-gray-900">
                  {Number(finance.totalHours || 0).toFixed(1)}h
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Buổi đã thanh toán</span>
                <span className="font-semibold text-emerald-600">
                  {finance.paidSessions ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Buổi đã xác nhận</span>
                <span className="font-semibold text-blue-600">
                  {finance.confirmedSessions ?? 0}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Danh sách lớp và học viên</h3>
        {loading ? (
          <div className="text-sm text-gray-500">Đang tải danh sách lớp...</div>
        ) : classes.length === 0 ? (
          <div className="text-sm text-gray-500">Chưa có lớp nào được phân công.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Lớp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Lịch học
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Sĩ số
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Học viên
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classes.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.className || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.schedule || "Chưa có lịch"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.currentStudents || 0}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {Array.isArray(item.students) && item.students.length > 0
                        ? item.students
                            .slice(0, 3)
                            .map((student) => student?.fullName || "N/A")
                            .join(", ")
                        : "Chưa có học viên"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Điểm danh gần nhất</h3>
        {loading ? (
          <div className="text-sm text-gray-500">Đang tải điểm danh...</div>
        ) : latestAttendance.length === 0 ? (
          <div className="text-sm text-gray-500">Chưa có dữ liệu điểm danh.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Học viên
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Lớp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Ngày
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {latestAttendance.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3 text-gray-900">
                      {item.studentId?.fullName || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.classId?.className || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.date ? new Date(item.date).toLocaleDateString("vi-VN") : "--"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "present"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {item.status === "present" ? "Có mặt" : "Vắng"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && students.length === 0 && classes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl px-4 py-3 text-sm">
          Chưa có dữ liệu học viên theo lớp. Vui lòng kiểm tra ghi danh.
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
