import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { Award, Star } from "lucide-react";

const TeacherPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Since we don't have a public endpoint for teachers yet, we can either:
    // 1. Create one in userController (getTeachers)
    // 2. Or filter current users if we have permission (likely not public)
    // For now, I'll mock the data structurally to match the UI plan,
    // anticipating the backend endpoint creation or using static data if preferred.
    // Ideally: axiosClient.get('/users/teachers');

    // Let's assume we fetch from a new endpoint or use a filtered public list
    // Note: The previous task didn't explicitly create a public 'get teachers' endpoint.
    // I'll simulate it for now or try to fetch if available.

    // Use static data for demo purposes as user requested "wow" UI
    // and we might not have real teacher data populated yet.
    const demoTeachers = [
      {
        _id: "1",
        fullName: "Nguyễn Thành Luân",
        specialization: "Grandmaster (GM)",
        experienceYears: 15,
        avatar:
          "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        bio: "Vô địch quốc gia 2020, Huấn luyện viên trưởng đội tuyển trẻ thành phố.",
      },
      {
        _id: "2",
        fullName: "Trần Thị Kiện Tướng",
        specialization: "Woman Grandmaster (WGM)",
        experienceYears: 10,
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        bio: "Chuyên gia khai cuộc và cờ tàn. Đã đào tạo nhiều học viên đạt giải quốc tế.",
      },
      {
        _id: "3",
        fullName: "Lê master",
        specialization: "FIDE Master (FM)",
        experienceYears: 8,
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        bio: "Phong cách giảng dạy dí dỏm, dễ hiểu. Rất được các bạn nhỏ yêu thích.",
      },
      {
        _id: "4",
        fullName: "Phạm Huấn Luyện",
        specialization: "National Master (NM)",
        experienceYears: 12,
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        bio: "Kinh nghiệm dày dặn trong việc phát hiện và bồi dưỡng tài năng trẻ.",
      },
    ];

    setTeachers(demoTeachers);
    setLoading(false);
  }, []);

  return (
    <div className="bg-white">
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Đội Ngũ Giảng Viên
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gặp gỡ những Kiện tướng, Huấn luyện viên tâm huyết và giàu kinh
            nghiệm của chúng tôi.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teachers.map((teacher) => (
            <div
              key={teacher._id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group ring-1 ring-gray-100"
            >
              <div className="relative h-64 overflow-hidden bg-gray-200">
                <img
                  src={teacher.avatar}
                  alt={teacher.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-white text-sm">{teacher.bio}</p>
                </div>
              </div>

              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {teacher.fullName}
                </h3>
                <p className="text-primary font-medium mb-3">
                  {teacher.specialization}
                </p>

                <div className="flex justify-center items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-lg">
                      {teacher.experienceYears}+
                    </span>
                    <span>Năm KN</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-lg flex items-center justify-center gap-1">
                      5.0{" "}
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </span>
                    <span>Đánh giá</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
