import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import classService from "../../../../services/classService";

const TeacherClassList = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?._id || user?.userId;
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!teacherId) return;
        const data = await classService.getByTeacher(teacherId);
        setClasses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load classes", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherId]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Lớp học của tôi</h1>
      {loading ? (
        <div className="text-gray-500">Đang tải lớp học...</div>
      ) : classes.length === 0 ? (
        <div className="text-gray-500">Chưa có lớp nào được phân công.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((c) => (
            <div key={c._id} className="bg-white rounded-lg border p-4 space-y-2">
              <h2 className="font-semibold text-lg">{c.className}</h2>
              <p className="text-sm text-gray-500">Lịch học: {c.schedule || "Chưa cập nhật"}</p>
              <p className="text-sm text-gray-500">Sĩ số: {c.currentStudents || 0}</p>
              <div className="flex gap-2 pt-2">
                <Link className="px-3 py-1.5 bg-blue-600 text-white rounded" to={`/teacher/classes/${c._id}`}>
                  Chi tiết
                </Link>
                <Link className="px-3 py-1.5 bg-emerald-600 text-white rounded" to={`/teacher/attendance?classId=${c._id}`}>
                  Điểm danh
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClassList;
