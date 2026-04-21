import React, { useState, useEffect } from "react";
import teacherService from "../../services/teacherService";
import { useNavigate } from "react-router-dom";
import { usePublicCms } from "../../context/PublicCmsContext";

const TeacherPage = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cms } = usePublicCms();
  const page = cms?.teachersPage || {};
  const theme = cms?.theme || {};

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const data = await teacherService.getAll();
        setTeachers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch teachers", error);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <div className="bg-white">
      <div
        className="py-20"
        style={{
          backgroundColor: page?.heroBackground ? undefined : "#F9FAFB",
          backgroundImage: page?.heroBackground ? `url(${page.heroBackground})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {page?.title || "Đội Ngũ Giảng Viên"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {page?.description ||
              "Gặp gỡ những Kiện tướng, Huấn luyện viên tâm huyết và giàu kinh nghiệm của chúng tôi."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="text-center text-gray-500">Đang tải danh sách giáo viên...</div>
        ) : teachers.length === 0 ? (
          <div className="text-center text-gray-500">Chưa có dữ liệu giáo viên.</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teachers.map((teacher) => (
            <div
              key={teacher._id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group ring-1 ring-gray-100"
            >
              <div className="relative h-64 overflow-hidden bg-gray-200">
                <img
                  src={
                    teacher.avatarUrl ||
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                  }
                  alt={teacher.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-white text-sm">
                    {teacher.certification || "Giáo viên trung tâm Z Chess"}
                  </p>
                </div>
              </div>

              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {teacher.fullName}
                </h3>
                <p className="text-primary font-medium mb-3">
                  {teacher.specialization || "Giáo viên cờ vua"}
                </p>

                <div className="flex justify-center items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-lg">
                      {teacher.experienceYears || 0}+
                    </span>
                    <span>Năm KN</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-lg flex items-center justify-center gap-1">
                      {teacher.status || "Active"}
                    </span>
                    <span>Trạng thái</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/teachers/${teacher._id}`)}
                  className="mt-4 w-full px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 text-sm font-medium"
                  style={{ borderRadius: theme?.buttonRadius || undefined }}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPage;
