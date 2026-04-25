import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import studentService from "../../../services/studentService";
import parentService from "../../../services/parentService";
import authService from "../../../services/authService";
import formMetadataService from "../../../services/formMetadataService";
import DynamicFormFields from "../../../components/forms/DynamicFormFields";
import { validateRequiredFields } from "../../../utils/formValidation";

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase();
const isAdminUser = (user) => normalizeRole(user?.role) === "admin";

const FALLBACK_STUDENT_FIELDS = [
  { name: "fullName", label: "Họ và tên", type: "text", required: true },
  { name: "dateOfBirth", label: "Ngày sinh", type: "date", required: false },
  { name: "enrollmentDate", label: "Ngày nhập học", type: "date", required: false },
  { name: "skillLevel", label: "Level", type: "select", required: false, options: [] },
  { name: "gender", label: "Giới tính", type: "select", required: false, options: [] },
  { name: "phone", label: "SĐT", type: "text", required: false },
  { name: "address", label: "Địa chỉ", type: "text", required: false },
  { name: "parentId", label: "Phụ huynh", type: "select", required: true, optionsSource: "parents" },
  { name: "totalSessions", label: "Tổng số buổi", type: "number", required: false },
  { name: "completedLessons", label: "Số buổi đã học", type: "number", required: false },
];

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const currentUser = authService.getCurrentUser();
  const isAdmin = isAdminUser(currentUser);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [parents, setParents] = useState([]);
  const [fieldConfigs, setFieldConfigs] = useState([]);
  const [meta, setMeta] = useState({
    totalLessons: 0,
    completedLessons: 0,
  });
  const [formData, setFormData] = useState({
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
    () =>
      parents.find((item) => String(item._id) === String(formData.parentId)),
    [parents, formData.parentId],
  );

  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;
    const bootstrap = async () => {
      try {
        const [parentList, metadata] = await Promise.all([
          parentService.getAll(),
          formMetadataService.getFormConfig(
            "student",
            isEditMode ? "update" : "create",
          ),
        ]);
        if (!mounted) return;
        setParents(Array.isArray(parentList) ? parentList : []);
        setFieldConfigs(
          Array.isArray(metadata?.fields) && metadata.fields.length > 0
            ? metadata.fields
            : FALLBACK_STUDENT_FIELDS,
        );

        if (isEditMode) {
          setLoading(true);
          const student = await studentService.getById(id);
          if (!mounted) return;
          const totalLessons = Number(
            student?.totalLessons ?? student?.totalSessions ?? 0,
          );
          const completedLessons = Number(student?.completedLessons ?? 0);
          setMeta({ totalLessons, completedLessons });
          setFormData((prev) => ({
            ...prev,
            fullName: student?.fullName || "",
            dateOfBirth: student?.dateOfBirth
              ? String(student.dateOfBirth).slice(0, 10)
              : "",
            enrollmentDate: student?.enrollmentDate
              ? String(student.enrollmentDate).slice(0, 10)
              : "",
            phone: student?.parentId?.phone || "",
            skillLevel: student?.skillLevel || "",
            address: student?.address || "",
            totalSessions: Number(
              student?.totalSessions ?? student?.totalLessons ?? 0,
            ),
            completedLessons,
            parentId: student?.parentId?._id || "",
            status:
              totalLessons > 0 && completedLessons >= totalLessons
                ? "completed"
                : "active",
          }));
        }
      } catch (error) {
        if (mounted) {
          setFieldConfigs(FALLBACK_STUDENT_FIELDS);
        }
        toast.error(
          error?.response?.data?.message || "Không tải được dữ liệu học viên",
        );
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
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    const requiredErrors = validateRequiredFields(fieldConfigs, formData);
    if (Object.keys(requiredErrors).length > 0) {
      setErrors(requiredErrors);
      toast.error("Vui lòng nhập đầy đủ các trường bắt buộc");
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
      gender: formData.gender || undefined,
      phone: formData.phone || undefined,
    };

    if (payload.completedLessons > payload.totalLessons) {
      toast.error("Số buổi đã học không được lớn hơn tổng số buổi");
      return;
    }

    if (isEditMode && formData.status === "completed") {
      payload.completedLessons =
        payload.totalLessons || meta.totalLessons || meta.completedLessons || 1;
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
            {isEditMode
              ? "Chỉnh sửa thông tin học viên hiện có."
              : "Nhập thông tin để tạo hồ sơ học viên."}
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

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6"
      >
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DynamicFormFields
            fields={fieldConfigs.map((field) => ({
              ...field,
              fullWidth: field.name === "address",
              options:
                field.optionsSource === "parents"
                  ? parents.map((parent) => ({
                      value: parent._id,
                      label: `${parent.fullName} - ${parent.phone || "N/A"}`,
                    }))
                  : field.options,
            }))}
            values={formData}
            errors={errors}
            onChange={handleChange}
          />
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
