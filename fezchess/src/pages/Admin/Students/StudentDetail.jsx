import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import studentService from "../../../services/studentService";
import { getSkillLevelLabel } from "../../../utils/studentLevel";

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await studentService.getById(id);
        setStudent(data);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Không thể tải chi tiết học viên",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Đang tải dữ liệu...
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/students")}
          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
        <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl">
          {error || "Không tìm thấy học viên"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {student.fullName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Mã học viên: {student.studentId || "N/A"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/students")}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Danh sách
          </button>
          <button
            onClick={() => navigate(`/students/edit/${student._id || id}`)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Edit size={16} />
            Chỉnh sửa
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <User size={16} />
            <span className="font-medium">Trình độ:</span>
            <span>{getSkillLevelLabel(student.skillLevel)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin size={16} />
            <span className="font-medium">Địa chỉ:</span>
            <span>{student.address || "Chưa cập nhật"}</span>
          </div>
          <div className="text-gray-700">
            <span className="font-medium">Ngày sinh: </span>
            {student.dateOfBirth
              ? new Date(student.dateOfBirth).toLocaleDateString("vi-VN")
              : "Chưa cập nhật"}
          </div>
          <div className="text-gray-700">
            <span className="font-medium">Ngày nhập học: </span>
            {student.enrollmentDate
              ? new Date(student.enrollmentDate).toLocaleDateString("vi-VN")
              : "Chưa cập nhật"}
          </div>
          <div className="text-gray-700">
            <span className="font-medium">Tiến độ: </span>
            {student.completedLessons || 0}/{student.totalLessons || 0} buổi
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Thông tin phụ huynh
        </h2>
        <div className="space-y-2 text-sm text-gray-700">
          <div>
            <span className="font-medium">Họ tên:</span>{" "}
            {student.parentId?.fullName || "Chưa cập nhật"}
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} />
            <span>{student.parentId?.phone || "Chưa cập nhật"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={14} />
            <span>{student.parentId?.email || "Chưa cập nhật"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
