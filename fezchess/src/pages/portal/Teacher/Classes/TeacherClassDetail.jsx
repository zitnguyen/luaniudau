import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import classService from "../../../../services/classService";
import enrollmentService from "../../../../services/enrollmentService";

const TeacherClassDetail = () => {
  const { classId } = useParams();
  const [classInfo, setClassInfo] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cls, enrs] = await Promise.all([
          classService.getById(classId),
          enrollmentService.getAll({ classId }),
        ]);
        setClassInfo(cls);
        setEnrollments(Array.isArray(enrs) ? enrs : []);
      } catch (error) {
        console.error("Failed to load class detail", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [classId]);

  if (loading) return <div className="p-6 text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{classInfo?.className || "Chi tiết lớp"}</h1>
      <div className="bg-white border rounded-lg p-4 text-sm text-gray-700 space-y-1">
        <div>Lịch: {classInfo?.schedule || "Chưa cập nhật"}</div>
        <div>Trạng thái: {classInfo?.status || "N/A"}</div>
        <div>Sĩ số hiện tại: {classInfo?.currentStudents || 0}</div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 font-semibold border-b">Danh sách học viên</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Học viên</th>
              <th className="text-left px-4 py-2">Mã HV</th>
              <th className="text-left px-4 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e._id} className="border-t">
                <td className="px-4 py-2">{e.studentId?.fullName || "N/A"}</td>
                <td className="px-4 py-2">{e.studentId?.studentId || "N/A"}</td>
                <td className="px-4 py-2">{e.status || "Active"}</td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={3}>
                  Chưa có học viên ghi danh.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherClassDetail;
