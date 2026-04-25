import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import TableSkeleton from "../../../components/ui/TableSkeleton";
import studentService from "../../../services/studentService";
import authService from "../../../services/authService";
import useUndoDelete from "../../../hooks/useUndoDelete";
import formMetadataService from "../../../services/formMetadataService";
import DynamicFormFields from "../../../components/forms/DynamicFormFields";

const normalizeRole = (role) => String(role || "").trim().toLowerCase();
const isAdminUser = (user) => normalizeRole(user?.role) === "admin";
const FALLBACK_FILTER_FIELDS = [
  {
    name: "keyword",
    label: "Từ khóa",
    type: "text",
    required: false,
    placeholder: "Tìm theo tên học viên hoặc phụ huynh",
  },
  {
    name: "status",
    label: "Trạng thái",
    type: "select",
    required: false,
    options: [
      { value: "all", label: "Tất cả trạng thái" },
      { value: "active", label: "Đang học" },
      { value: "completed", label: "Hoàn thành" },
    ],
  },
];

const getStudentStatus = (student) => {
  const total = Number(student?.totalLessons ?? student?.totalSessions ?? 0);
  const completed = Number(student?.completedLessons ?? 0);
  if (total > 0 && completed >= total) {
    return {
      value: "completed",
      label: "Hoàn thành",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  return {
    value: "active",
    label: "Đang học",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  };
};

const getStudentProgress = (student) => {
  const studied = Number(student?.completedLessons ?? 0);
  const total = Number(student?.totalLessons ?? student?.totalSessions ?? 0);
  return {
    studied: Number.isFinite(studied) ? studied : 0,
    total: Number.isFinite(total) ? total : 0,
  };
};

const StudentList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();
  const isAdmin = isAdminUser(currentUser);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterConfig, setFilterConfig] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", status: "all" });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const { scheduleUndoDelete } = useUndoDelete();

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const [data, metadata] = await Promise.all([
          studentService.getAll(),
          formMetadataService.getFormConfig("student", "filter"),
        ]);
        if (!mounted) return;
        setStudents(Array.isArray(data) ? data : []);
        setFilterConfig(
          Array.isArray(metadata?.fields) && metadata.fields.length > 0
            ? metadata.fields
            : FALLBACK_FILTER_FIELDS,
        );
      } catch (error) {
        if (!mounted) return;
        setFilterConfig(FALLBACK_FILTER_FIELDS);
        toast.error(error?.response?.data?.message || "Không tải được danh sách học viên");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    const updatedId = location.state?.updatedStudentId || location.state?.updatedStudent?._id;
    if (!updatedId) return;
    setHighlightedRowId(updatedId);
    toast.success("✔ Cập nhật thành công");
    const timeout = setTimeout(() => setHighlightedRowId(null), 2000);
    return () => clearTimeout(timeout);
  }, [location.state?.updatedAt, location.state?.updatedStudentId, location.state?.updatedStudent?._id]);

  useEffect(() => {
    if (location.state?.createdAt) {
      toast.success("✔ Tạo thành công");
    }
  }, [location.state?.createdAt]);

  const filteredStudents = useMemo(() => {
      const term = String(filters.keyword || "")
        .trim()
        .toLowerCase();
    return students.filter((student) => {
      const status = getStudentStatus(student).value;
        if (filters.status !== "all" && status !== filters.status) return false;
      if (!term) return true;
      return (
        String(student?.fullName || "").toLowerCase().includes(term) ||
        String(student?.parentId?.fullName || "").toLowerCase().includes(term)
      );
    });
  }, [students, filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = (studentId) => {
    const deletingStudent = students.find((item) => item._id === studentId);
    if (!deletingStudent) return;
    setDeleteConfirmId(null);
    scheduleUndoDelete({
      id: studentId,
      item: deletingStudent,
      removeOptimistic: () => setStudents((prev) => prev.filter((item) => item._id !== studentId)),
      restoreOptimistic: (item) => setStudents((prev) => [item, ...prev]),
      commitDelete: () => studentService.delete(studentId),
      successMessage: "✔ Xóa thành công",
      pendingMessage: "Đã xóa học viên - Hoàn tác?",
      errorMessage: "❌ Xóa thất bại",
    });
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          403 - Bạn không có quyền truy cập chức năng quản lý học viên.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý học viên</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách và thao tác CRUD học viên dành cho Admin.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/students/create")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Plus size={16} />
          Tạo học viên
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DynamicFormFields
              fields={filterConfig}
              values={filters}
              errors={{}}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Họ tên</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Ngày sinh</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">SĐT</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Parent</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tiến độ</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <TableSkeleton rows={6} cols={7} />
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    Không có học viên phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const status = getStudentStatus(student);
                  const progress = getStudentProgress(student);
                  return (
                    <tr
                      key={student._id}
                      className={`transition-colors ${highlightedRowId === student._id ? "bg-emerald-50" : "hover:bg-gray-50"}`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{student.fullName || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("vi-VN") : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.parentId?.phone || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.parentId?.fullName || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="font-semibold">{progress.studied}</span>
                        <span className="text-gray-500"> / {progress.total} buổi</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/students/${student._id}`)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            title="Chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/students/${student._id}/edit`)}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(student._id)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                            {deleteConfirmId === student._id && (
                              <div className="absolute right-0 top-10 z-10 w-52 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                                <p className="text-xs text-gray-700 mb-3">Bạn có chắc muốn xóa?</p>
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="rounded-md bg-gray-100 px-2.5 py-1.5 text-xs text-gray-700"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(student._id)}
                                    className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs text-white"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
