import React, { useEffect, useMemo, useState } from "react";
import payrollService from "../../../services/payrollService";
import classService from "../../../services/classService";
import { toast } from "sonner";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value) || 0,
  );

const AdminPayroll = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [teacherDetail, setTeacherDetail] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSessionId, setSavingSessionId] = useState("");
  const [editingSessionId, setEditingSessionId] = useState("");
  const [salaryDraft, setSalaryDraft] = useState({});
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1));
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()));
  const [exportingType, setExportingType] = useState("");
  const [classes, setClasses] = useState([]);
  const [creatingSession, setCreatingSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    teacherId: "",
    classId: "",
    date: "",
    startTime: "",
    endTime: "",
    salary: "",
    note: "",
  });

  const loadTeachers = async () => {
    const [teacherRows, summaryData] = await Promise.all([
      payrollService.getAdminPayroll(),
      payrollService.getPayrollSummary(),
    ]);
    const rows = Array.isArray(teacherRows) ? teacherRows : [];
    setTeachers(rows);
    setSummary(summaryData?.summary || null);
    if (!selectedTeacherId && rows.length > 0) {
      setSelectedTeacherId(rows[0].teacher?._id || "");
    }
  };

  const loadClasses = async () => {
    const rows = await classService.getAll();
    setClasses(Array.isArray(rows) ? rows : []);
  };

  const loadTeacherDetail = async (teacherId) => {
    if (!teacherId) {
      setTeacherDetail(null);
      return;
    }
    const detail = await payrollService.getAdminPayrollByTeacher(teacherId);
    setTeacherDetail(detail || null);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([loadTeachers(), loadClasses()]);
    } catch (e) {
      toast.error("Không thể tải dữ liệu bảng lương.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    loadTeacherDetail(selectedTeacherId).catch(() => {
      toast.error("Không thể tải chi tiết bảng lương theo giáo viên.");
    });
  }, [selectedTeacherId]);

  const selectedTeacherName = useMemo(
    () =>
      teacherDetail?.teacher?.fullName ||
      teacherDetail?.teacher?.username ||
      "Giáo viên",
    [teacherDetail],
  );

  const availableClasses = useMemo(
    () =>
      classes.filter(
        (item) =>
          String(item.teacherId?._id || item.teacherId) ===
          String(sessionForm.teacherId || selectedTeacherId),
      ),
    [classes, sessionForm.teacherId, selectedTeacherId],
  );

  const handleSalaryChange = async (sessionId, value) => {
    try {
      setSavingSessionId(sessionId);
      const salary = Number(value);
      await payrollService.updateSessionSalary(sessionId, salary);
      await Promise.all([loadTeacherDetail(selectedTeacherId), loadTeachers()]);
      toast.success("Đã cập nhật lương ca dạy.");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không thể cập nhật lương.");
    } finally {
      setSavingSessionId("");
    }
  };

  const startEditSalary = (sessionId, currentSalary) => {
    setEditingSessionId(sessionId);
    setSalaryDraft((prev) => ({
      ...prev,
      [sessionId]: currentSalary ?? "",
    }));
  };

  const cancelEditSalary = (sessionId) => {
    setEditingSessionId("");
    setSalaryDraft((prev) => {
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });
  };

  const saveSalary = async (sessionId) => {
    await handleSalaryChange(sessionId, salaryDraft[sessionId]);
    setEditingSessionId("");
  };

  const resetSalary = async (sessionId) => {
    try {
      setSavingSessionId(sessionId);
      await payrollService.resetSessionSalary(sessionId);
      await Promise.all([loadTeacherDetail(selectedTeacherId), loadTeachers()]);
      if (editingSessionId === sessionId) {
        setEditingSessionId("");
      }
      toast.success("Đã đặt lại lương ca dạy.");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không thể đặt lại lương.");
    } finally {
      setSavingSessionId("");
    }
  };

  const handleExport = async (type) => {
    if (!selectedTeacherId) {
      toast.error("Vui lòng chọn giáo viên trước khi xuất phiếu lương.");
      return;
    }
    try {
      setExportingType(type);
      const teacherName =
        teacherDetail?.teacher?.fullName || teacherDetail?.teacher?.username || "Teacher";
      await payrollService.exportPayslip({
        teacherId: selectedTeacherId,
        month: filterMonth,
        year: filterYear,
        type,
        fallback: `Payslip_${teacherName}_${filterMonth}_${filterYear}`,
      });
      toast.success(`Đã xuất phiếu lương ${type.toUpperCase()}.`);
    } catch (e) {
      if (e?.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed?.message) {
            toast.error(parsed.message);
            return;
          }
        } catch {
          // ignore blob parse errors
        }
      }
      toast.error(e?.response?.data?.message || "Xuất phiếu lương thất bại.");
    } finally {
      setExportingType("");
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      setCreatingSession(true);
      await payrollService.createAdminSession({
        teacherId: sessionForm.teacherId || selectedTeacherId,
        classId: sessionForm.classId,
        date: sessionForm.date,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        salary: sessionForm.salary === "" ? null : Number(sessionForm.salary),
        note: sessionForm.note,
      });
      setSessionForm({
        teacherId: selectedTeacherId || "",
        classId: "",
        date: "",
        startTime: "",
        endTime: "",
        salary: "",
        note: "",
      });
      await Promise.all([loadTeacherDetail(selectedTeacherId), loadTeachers()]);
      toast.success("Đã thêm ca lương.");
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Không thể tạo ca bảng lương.");
    } finally {
      setCreatingSession(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Bạn có chắc muốn xóa ca dạy này?")) return;
    try {
      await payrollService.deleteSession(sessionId);
      await Promise.all([loadTeacherDetail(selectedTeacherId), loadTeachers()]);
      toast.success("Đã xóa ca dạy.");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không thể xóa ca dạy.");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Đang tải bảng lương...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h1 className="text-2xl font-bold text-gray-900">Bảng lương quản lý giáo viên</h1>
        <p className="text-sm text-gray-500 mt-1">
          Admin quản lý lương theo từng ca dạy. Lương chỉ được thiết lập tại trang này.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tháng</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={String(m)}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Năm</label>
            <input
              type="number"
              min="2000"
              max="3000"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => handleExport("excel")}
            disabled={exportingType !== ""}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {exportingType === "excel" ? "Đang xuất..." : "Xuất Excel"}
          </button>
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={exportingType !== ""}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-60"
          >
            {exportingType === "pdf" ? "Đang xuất..." : "Xuất PDF"}
          </button>
        </div>
        <form className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-2" onSubmit={handleCreateSession}>
          <select
            value={sessionForm.teacherId || selectedTeacherId}
            onChange={(e) =>
              setSessionForm((prev) => ({ ...prev, teacherId: e.target.value, classId: "" }))
            }
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            required
          >
            <option value="">Chọn giáo viên</option>
            {teachers.map((item) => (
              <option key={item.teacher?._id} value={item.teacher?._id}>
                {item.teacher?.fullName || item.teacher?.username}
              </option>
            ))}
          </select>
          <select
            value={sessionForm.classId}
            onChange={(e) => setSessionForm((prev) => ({ ...prev, classId: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            required
          >
            <option value="">Chọn lớp</option>
            {availableClasses.map((item) => (
              <option key={item._id} value={item._id}>
                {item.className}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={sessionForm.date}
            onChange={(e) => setSessionForm((prev) => ({ ...prev, date: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            required
          />
          <input
            type="time"
            value={sessionForm.startTime}
            onChange={(e) => setSessionForm((prev) => ({ ...prev, startTime: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            required
          />
          <input
            type="time"
            value={sessionForm.endTime}
            onChange={(e) => setSessionForm((prev) => ({ ...prev, endTime: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            required
          />
          <button
            type="submit"
            disabled={creatingSession}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60 text-sm"
          >
            {creatingSession ? "Đang thêm..." : "Thêm ca lương"}
          </button>
        </form>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-xs text-gray-500">Tổng giáo viên</div>
            <div className="text-2xl font-bold text-gray-900">{summary.totalTeachers || 0}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-xs text-gray-500">Tổng ca dạy</div>
            <div className="text-2xl font-bold text-gray-900">{summary.totalSessions || 0}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-xs text-gray-500">Tổng giờ dạy</div>
            <div className="text-2xl font-bold text-gray-900">{summary.totalHours || 0}h</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-xs text-gray-500">Tổng lương</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatMoney(summary.totalSalary)}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">
            Danh sách giáo viên
          </div>
          <div className="divide-y divide-gray-100">
            {teachers.map((item) => {
              const teacher = item.teacher || {};
              const active = String(teacher._id) === String(selectedTeacherId);
              return (
                <button
                  type="button"
                  key={teacher._id}
                  onClick={() => setSelectedTeacherId(teacher._id)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    active ? "bg-primary/10" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {teacher.fullName || teacher.username}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.totalSessions} ca - {formatMoney(item.totalSalary)}
                  </div>
                </button>
              );
            })}
            {teachers.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">Chưa có giáo viên.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-800">Chi tiết lương: {selectedTeacherName}</div>
            <div className="text-xs text-gray-500 mt-1">
              Tổng lương giáo viên: {formatMoney(teacherDetail?.totalSalary || 0)}
            </div>
          </div>
          <div className="overflow-x-auto">
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
                    Giờ dạy
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Lương
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(teacherDetail?.sessions || []).map((session) => (
                  <tr key={session._id}>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(session.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {session.classId?.className || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {session.startTime} - {session.endTime}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {session.durationHours || 0}h
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {editingSessionId === session._id ? (
                        <input
                          type="number"
                          min="0"
                          value={salaryDraft[session._id] ?? ""}
                          onChange={(e) =>
                            setSalaryDraft((prev) => ({
                              ...prev,
                              [session._id]: e.target.value,
                            }))
                          }
                          disabled={savingSessionId === session._id}
                          className="w-36 px-3 py-2 border border-gray-200 rounded-lg"
                          placeholder="Nhập lương"
                        />
                      ) : (
                        <span className="font-medium">
                          {session.salary == null ? "Chưa nhập" : formatMoney(session.salary)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      <div className="flex items-center justify-end gap-2">
                        {editingSessionId === session._id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveSalary(session._id)}
                              disabled={savingSessionId === session._id}
                              className="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelEditSalary(session._id)}
                              disabled={savingSessionId === session._id}
                              className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60"
                            >
                              Hủy
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditSalary(session._id, session.salary)}
                            disabled={savingSessionId === session._id}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                          >
                            Sửa
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => resetSalary(session._id)}
                          disabled={savingSessionId === session._id}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
                        >
                          Đặt lại
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(session._id)}
                          disabled={savingSessionId === session._id}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(teacherDetail?.sessions || []).length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      Giáo viên này chưa có ca dạy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayroll;
