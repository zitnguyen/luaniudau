import { useState, useEffect } from "react";
import ScrollReveal from "../common/ScrollReveal";
import CourseCard from "../cards/CourseCard";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import courseService from "../../services/courseService";

const CoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Khóa học
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Khóa học phổ biến
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Các khóa học được thiết kế phù hợp với từng trình độ, từ người mới
            bắt đầu đến kỳ thủ chuyên nghiệp.
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
                      students={course.totalDuration ? `${course.totalDuration}p` : "N/A"} // Reusing students prop for duration or other info if CourseCard expects number
                      rating={5.0}
                      price={course.price === 0 ? "Miễn phí" : `${course.price?.toLocaleString()}đ`}
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
            >
              Xem tất cả khóa học →
            </motion.button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CoursesSection;
