import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import studentService from "../../../services/studentService";
import parentService from "../../../services/parentService";
import authService from "../../../services/authService";
import { STUDENT_SKILL_LEVELS, getSkillLevelLabel } from "../../../utils/studentLevel";

const normalizeRole = (role) => String(role || "").trim().toLowerCase();
const isAdminUser = (user) => normalizeRole(user?.role) === "admin";

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const currentUser = authService.getCurrentUser();
  const isAdmin = isAdminUser(currentUser);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [parents, setParents] = useState([]);
  const [meta, setMeta] = useState({
    totalLessons: 0,
    completedLessons: 0,
  });
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    dateOfBirth: "",
    enrollmentDate: "",
    gender: "",
    skillLevel: "",
    address: "",
    phone: "",
    totalSessions: 0,
    completedLessons: 0,
    parentId: "",
    status: "active",
  });

  const selectedParent = useMemo(
    () => parents.find((item) => String(item._id) === String(formData.parentId)),
    [parents, formData.parentId],
  );

  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;
    const bootstrap = async () => {
      try {
        const parentList = await parentService.getAll();
        if (!mounted) return;
        setParents(Array.isArray(parentList) ? parentList : []);

        if (isEditMode) {
          setLoading(true);
          const student = await studentService.getById(id);
          if (!mounted) return;
          const totalLessons = Number(student?.totalLessons ?? student?.totalSessions ?? 0);
          const completedLessons = Number(student?.completedLessons ?? 0);
          setMeta({ totalLessons, completedLessons });
          setFormData((prev) => ({
            ...prev,
            fullName: student?.fullName || "",
            dateOfBirth: student?.dateOfBirth ? String(student.dateOfBirth).slice(0, 10) : "",
            enrollmentDate: student?.enrollmentDate
              ? String(student.enrollmentDate).slice(0, 10)
              : "",
            phone: student?.parentId?.phone || "",
            skillLevel: student?.skillLevel || "",
            address: student?.address || "",
            totalSessions: Number(student?.totalSessions ?? student?.totalLessons ?? 0),
            completedLessons,
            parentId: student?.parentId?._id || "",
            status: totalLessons > 0 && completedLessons >= totalLessons ? "completed" : "active",
          }));
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Không tải được dữ liệu học viên");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [id, isEditMode, isAdmin]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập họ tên học viên");
      return;
    }
    if (!formData.parentId) {
      toast.error("Vui lòng chọn phụ huynh");
      return;
    }

    const payload = {
      fullName: formData.fullName.trim(),
      dateOfBirth: formData.dateOfBirth || undefined,
      enrollmentDate: formData.enrollmentDate || undefined,
      skillLevel: formData.skillLevel || undefined,
      address: formData.address?.trim() || undefined,
      totalSessions: Number(formData.totalSessions || 0),
      totalLessons: Number(formData.totalSessions || 0),
      completedLessons: Number(formData.completedLessons || 0),
      parentId: formData.parentId,
      parentPhone: selectedParent?.phone || formData.phone || undefined,
      username: formData.username || undefined,
      email: formData.email || undefined,
      password: formData.password || undefined,
      gender: formData.gender || undefined,
      phone: formData.phone || undefined,
    };

    if (payload.completedLessons > payload.totalLessons) {
      toast.error("Số buổi đã học không được lớn hơn tổng số buổi");
      return;
    }

    if (isEditMode && formData.status === "completed") {
      payload.completedLessons = payload.totalLessons || meta.totalLessons || meta.completedLessons || 1;
    }

    try {
      setSubmitting(true);
      let studentId = id;
      if (isEditMode) {
        await studentService.update(id, payload);
        toast.success("✔ Cập nhật thành công");
      } else {
        const created = await studentService.create(payload);
        studentId = created?._id;
        toast.success("✔ Tạo thành công");
      }

      navigate("/admin/students", {
        state: {
          updatedStudentId: studentId,
          updatedAt: Date.now(),
          createdAt: isEditMode ? undefined : Date.now(),
        },
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "❌ Lỗi khi lưu học viên");
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Cập nhật học viên" : "Tạo học viên mới"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode ? "Chỉnh sửa thông tin học viên hiện có." : "Nhập thông tin để tạo hồ sơ học viên."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/students")}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
        {!isEditMode && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="student_username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="student@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="******"
              />
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nhập học</label>
            <input
              type="date"
              name="enrollmentDate"
              value={formData.enrollmentDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">-- Chọn level --</option>
              {STUDENT_SKILL_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {getSkillLevelLabel(lvl)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="090..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Địa chỉ học viên"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent *</label>
            <select
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="">-- Chọn phụ huynh --</option>
              {parents.map((parent) => (
                <option key={parent._id} value={parent._id}>
                  {parent.fullName} - {parent.phone || "N/A"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số buổi</label>
            <input
              type="number"
              min={0}
              name="totalSessions"
              value={formData.totalSessions}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số buổi đã học</label>
            <input
              type="number"
              min={0}
              name="completedLessons"
              value={formData.completedLessons}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="active">Đang học</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          )}
        </section>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/students")}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={16} />
                {isEditMode ? "Cập nhật học viên" : "Tạo học viên"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
