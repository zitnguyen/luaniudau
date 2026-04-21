import React, { useEffect, useMemo, useState } from "react";
import classService from "../../../../services/classService";
import payrollService from "../../../../services/payrollService";
import authService from "../../../../services/authService";

const TeachingLogList = () => {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const user = authService.getCurrentUser();
  const teacherId = user?._id || user?.userId;

  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    start_time: "",
    end_time: "",
    class_id: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [sessionData, classData] = await Promise.all([
        payrollService.getTeacherSessions(),
        teacherId ? classService.getByTeacher(teacherId) : Promise.resolve([]),
      ]);
      setSessions(Array.isArray(sessionData) ? sessionData : []);
      setClasses(Array.isArray(classData) ? classData : []);
    } catch (e) {
      setError("Không thể tải dữ liệu ca dạy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalHours = useMemo(
    () =>
      Number(
        sessions.reduce((sum, item) => sum + (Number(item.durationHours) || 0), 0).toFixed(2),
      ),
    [sessions],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await payrollService.createTeacherSession(formData);
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        start_time: "",
        end_time: "",
        class_id: "",
      });
      await loadData();
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể lưu ca dạy.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h1 className="text-2xl font-bold text-gray-900">Ca dạy của tôi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Giáo viên chỉ nhập ca dạy (không nhập lương). Tổng giờ hiện tại: {totalHours}h.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tạo ca dạy</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          />
          <input
            type="time"
            required
            value={formData.start_time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, start_time: e.target.value }))
            }
            className="px-3 py-2 border border-gray-200 rounded-lg"
          />
          <input
            type="time"
            required
            value={formData.end_time}
            onChange={(e) => setFormData((prev) => ({ ...prev, end_time: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          />
          <select
            required
            value={formData.class_id}
            onChange={(e) => setFormData((prev) => ({ ...prev, class_id: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="">Chọn lớp</option>
            {classes.map((item) => (
              <option key={item._id} value={item._id}>
                {item.className}
              </option>
            ))}
          </select>
          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Đang lưu..." : "Lưu ca dạy"}
            </button>
          </div>
        </form>
        {error && (
          <div className="mt-3 text-sm px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 text-gray-500">Đang tải dữ liệu...</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Ngày
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Lớp
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Thời gian
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Số giờ
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(item.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.classId?.className || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.startTime} - {item.endTime}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.durationHours}h</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.status}</td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Chưa có ca dạy nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeachingLogList;
