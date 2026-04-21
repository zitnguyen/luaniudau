import React, { useEffect, useMemo, useState } from "react";
import classService from "../../../../services/classService";

const DAY_LABELS = {
  T2: "Thứ 2",
  T3: "Thứ 3",
  T4: "Thứ 4",
  T5: "Thứ 5",
  T6: "Thứ 6",
  T7: "Thứ 7",
  CN: "Chủ nhật",
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
        const schedule = c.schedule || "";
        const days = Object.keys(DAY_LABELS)
          .filter((d) => schedule.includes(d))
          .map((d) => DAY_LABELS[d]);
        const timeMatch = schedule.match(/\((.*?)\)/);
        return {
          classId: c._id,
          className: c.className,
          days: days.join(", ") || "Chưa rõ",
          time: timeMatch?.[1] || "Chưa rõ",
          rawSchedule: schedule || "Chưa cập nhật",
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
