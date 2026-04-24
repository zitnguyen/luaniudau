import { useState, useEffect } from "react";
import ScrollReveal from "../common/ScrollReveal";
import CourseCard from "../cards/CourseCard";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import courseService from "../../services/courseService";
import { usePublicCms } from "../../context/PublicCmsContext";

const CoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cms } = usePublicCms();
  const section = cms?.home?.courses || {};
  const theme = cms?.theme || {};

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseService.getPublishedCourses({ limit: 3 });
        // Handle response format if it's wrapped or just array
        const data = Array.isArray(res) ? res : res.data || []; 
        // Take first 3 for Home Page
        setCourses(data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <section
      className="py-20 bg-background"
      style={{
        backgroundColor: section?.sectionBgColor || undefined,
      }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{
              backgroundColor: section?.badgeBgColor || undefined,
              color: section?.badgeTextColor || undefined,
            }}
          >
            {section?.badge || "Khóa học"}
          </span>
          <h2
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
            style={{ color: section?.titleColor || undefined }}
          >
            {section?.title || "Khóa học phổ biến"}
          </h2>
          <p
            className="text-muted-foreground max-w-2xl mx-auto"
            style={{ color: section?.descriptionColor || undefined }}
          >
            {section?.description ||
              "Các khóa học được thiết kế phù hợp với từng trình độ, từ người mới bắt đầu đến kỳ thủ chuyên nghiệp."}
          </p>
        </ScrollReveal>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             <div className="col-span-full text-center text-muted-foreground">Đang tải dữ liệu...</div>
          ) : courses.length > 0 ? (
              courses.map((course, index) => (
                <ScrollReveal key={course._id} delay={index * 0.1}>
                  <Link to={`/courses/${course.slug}`}>
                    <CourseCard 
                      title={course.title}
                      description={course.description || "Khóa học cờ vua chất lượng cao"}
                      image={course.thumbnail || "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=400&h=300&fit=crop"}
                      level={course.level}
                      duration={`${course.totalLessons || 0} bài`} 
                      students={course.enrolledStudents || 0}
                      rating={5.0}
                      price={course.price === 0 ? "Miễn phí" : `${course.price?.toLocaleString()}đ`}
                      buttonText={section?.cardButtonText || "Xem chi tiết"}
                      buttonBgColor={section?.cardButtonBgColor}
                      buttonTextColor={section?.cardButtonTextColor}
                      buttonBorderColor={section?.cardButtonBorderColor}
                    />
                  </Link>
                </ScrollReveal>
              ))
          ) : (
              <div className="col-span-full text-center text-muted-foreground">Chưa có khóa học nào được mở.</div>
          )}
        </div>

        {/* CTA */}
        <ScrollReveal delay={0.3} className="text-center mt-12">
          <Link to="/courses">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-secondary text-secondary-foreground border border-border px-8 py-3 rounded-xl font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              style={{
                borderRadius: theme?.buttonRadius || undefined,
                backgroundColor: section?.buttonBgColor || undefined,
                color: section?.buttonTextColor || undefined,
                borderColor: section?.buttonBorderColor || undefined,
              }}
            >
              {section?.buttonText || "Xem tất cả khóa học →"}
            </motion.button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CoursesSection;
