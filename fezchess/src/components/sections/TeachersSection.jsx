import { useState, useEffect } from "react";
import ScrollReveal from "../common/ScrollReveal";
import TeacherCard from "../cards/TeacherCard";
// import teacherService from "../../services/teacherService"; // Using relative path if needed or absolute
import axiosClient from "../../api/axiosClient"; // Direct use for simplicity or use service if preferred

const TeachersSection = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // Use the new public endpoint
        const res = await axiosClient.get('/users/teachers');
        setTeachers(res);
      } catch (error) {
        console.error("Failed to fetch teachers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Đội ngũ
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Giáo viên xuất sắc
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Đội ngũ giáo viên giàu kinh nghiệm, đam mê và tận tâm với sự phát
            triển của từng học viên.
          </p>
        </ScrollReveal>

        {/* Teacher Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
             <div className="col-span-full text-center text-muted-foreground">Đang tải dữ liệu...</div>
          ) : teachers.length > 0 ? (
             teachers.map((teacher, index) => (
                <ScrollReveal key={teacher._id} delay={index * 0.1}>
                  <TeacherCard 
                    name={teacher.fullName}
                    title={teacher.specialization || "Giáo viên cờ vua"}
                    image={teacher.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"}
                    experience={`${teacher.experienceYears || 1} năm kinh nghiệm`}
                    specialization={teacher.certification || "Chứng chỉ Sư phạm"}
                  />
                </ScrollReveal>
              ))
          ) : (
             <div className="col-span-full text-center text-muted-foreground">Chưa có thông tin giáo viên.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TeachersSection;
