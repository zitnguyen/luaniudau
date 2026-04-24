import React, { useEffect, useMemo, useState } from "react";
import classService from "../../../../services/classService";

const DAY_LABELS = {
  0: "Chủ nhật",
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
};

const TeacherSchedule = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?._id || user?.userId;
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (!teacherId) return;
        const data = await classService.getByTeacher(teacherId);
        setClasses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load schedule", error);
      }
    };
    load();
  }, [teacherId]);

  const scheduleRows = useMemo(
    () =>
      classes.map((c) => {
        const slots = Array.isArray(c.scheduleSlots) ? c.scheduleSlots : [];
        const days = [...new Set(slots.map((slot) => DAY_LABELS[String(slot.day)]).filter(Boolean))];
        const times = [...new Set(slots.map((slot) => slot.time).filter(Boolean))];
        return {
          classId: c._id,
          className: c.className,
          days: days.join(", ") || "Chưa rõ",
          time: times.join(", ") || "Chưa rõ",
          rawSchedule: c.schedule || "Chưa cập nhật",
        };
      }),
    [classes],
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Lịch dạy</h1>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Lớp</th>
              <th className="text-left px-4 py-2">Ngày dạy</th>
              <th className="text-left px-4 py-2">Khung giờ</th>
              <th className="text-left px-4 py-2">Chuỗi lịch gốc</th>
            </tr>
          </thead>
          <tbody>
            {scheduleRows.map((row) => (
              <tr key={row.classId} className="border-t">
                <td className="px-4 py-2">{row.className}</td>
                <td className="px-4 py-2">{row.days}</td>
                <td className="px-4 py-2">{row.time}</td>
                <td className="px-4 py-2">{row.rawSchedule}</td>
              </tr>
            ))}
            {scheduleRows.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={4}>
                  Chưa có lớp được phân công.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherSchedule;
