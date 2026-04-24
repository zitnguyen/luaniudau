import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle } from "lucide-react";
import courseService from "../../../services/courseService";

const ParentMyCourses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [childrenCourses, setChildrenCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await courseService.getParentMyCourses();
        setChildrenCourses(Array.isArray(data?.children) ? data.children : []);
      } catch {
        setChildrenCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hasAnyCourse = childrenCourses.some(
    (child) => Array.isArray(child?.courses) && child.courses.length > 0,
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Khóa học của tôi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Danh sách khóa học đã mua của các bé. Nhấn vào để vào học ngay.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      ) : !hasAnyCourse ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Chưa có khóa học nào đã mua cho các bé.
        </div>
      ) : (
        childrenCourses.map((child) => (
          <div key={child.studentId} className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Bé: {child.studentName || "Học viên"}
            </h2>
            {Array.isArray(child.courses) && child.courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {child.courses.map((course) => (
                  <div
                    key={`${child.studentId}-${course._id}`}
                    className="rounded-lg border border-gray-100 p-3 flex gap-3 items-center"
                  >
                    <img
                      src={course.thumbnail || "https://placehold.co/120x80?text=Course"}
                      alt={course.title}
                      className="w-28 h-20 rounded object-cover bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{course.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {course.description || "Khóa học đã mua"}
                      </div>
                      <button
                        className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                        onClick={() => {
                          if (course.firstLessonId) {
                            navigate(`/learning/${course.slug}/${course.firstLessonId}`);
                            return;
                          }
                          navigate(`/courses/${course.slug}`);
                        }}
                      >
                        <PlayCircle size={16} />
                        Vào học
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Bé chưa có khóa học đã mua.</div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ParentMyCourses;
