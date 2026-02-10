import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
// import orderService from '../../services/orderService';
import { PlayCircle, Clock, FileText, CheckCircle, User, Star } from 'lucide-react';

const CourseDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [curriculum, setCurriculum] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await courseService.getCourseBySlug(slug);
                setCourse(res.course);
                setCurriculum(res.curriculum);
            } catch (error) {
                console.error("Failed to fetch course", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [slug]);

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/courses/${slug}` } });
            return;
        }
        // Logic for enrollment/purchase will go here
        alert("Tính năng thanh toán đang được hoàn thiện. Vui lòng liên hệ Admin để đăng ký.");
    };

    if (loading) return <div className="text-center py-20">Đang tải...</div>;
    if (!course) return <div className="text-center py-20">Không tìm thấy khóa học.</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Hero Section */}
            <div className="bg-gray-900 text-white py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="text-yellow-400 font-bold mb-4 uppercase tracking-wider text-sm">
                            {course.category} &bull; {course.level}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight font-heading">
                            {course.title}
                        </h1>
                        <p className="text-lg opacity-80 mb-8 leading-relaxed">
                            {course.description}
                        </p>
                        <div className="flex items-center gap-6 text-sm opacity-90 mb-8">
                            <div className="flex items-center gap-2">
                                <User size={18} />
                                <span>{course.instructor?.fullName || 'Daisy Team'}</span>
                            </div>
                            {/* <div className="flex items-center gap-2">
                                <Star size={18} className="text-yellow-400 fill-current" />
                                <span>4.9 (120 đánh giá)</span>
                            </div> */}
                            <div className="flex items-center gap-2">
                                <Clock size={18} />
                                <span>{course.totalDuration || 0} phút</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Course Preview / Purchase Card (In Hero for Desktop) */}
                    <div className="hidden md:block relative">
                         <div className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden max-w-sm ml-auto">
                            <div className="relative h-48 bg-gray-200">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                                        <PlayCircle size={64} className="opacity-50" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="text-3xl font-bold mb-6 text-center text-blue-900">
                                    {course.price === 0 ? "Miễn phí" : `${course.price?.toLocaleString()}đ`}
                                    {course.salePrice > 0 && (
                                        <span className="text-lg text-gray-400 line-through ml-3 font-normal">
                                            {course.salePrice.toLocaleString()}đ
                                        </span>
                                    )}
                                </div>
                                <button 
                                    onClick={handleEnroll}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mb-4 text-lg"
                                >
                                    {course.price === 0 ? "Học ngay" : "Mua khóa học"}
                                </button>
                                <div className="text-sm text-gray-500 text-center">
                                    Truy cập trọn đời &bull; Hoàn tiền trong 7 ngày
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Mobile Purchase Button (Sticky Bottom) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex items-center justify-between">
                <div>
                     <span className="block text-sm text-gray-500">Giá khóa học:</span>
                     <span className="text-xl font-bold text-blue-900">
                        {course.price === 0 ? "Miễn phí" : `${course.price?.toLocaleString()}đ`}
                     </span>
                </div>
                <button 
                    onClick={handleEnroll}
                    className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg"
                >
                    {course.price === 0 ? "Học ngay" : "Mua ngay"}
                </button>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2">
                    {/* Curriculum */}
                    <h2 className="text-2xl font-bold mb-6 font-heading text-gray-900">Nội dung khóa học</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {curriculum.length > 0 ? curriculum.map((chapter, index) => (
                            <div key={chapter._id} className="border-b border-gray-100 last:border-0">
                                <div className="bg-gray-50 px-6 py-4 font-semibold text-gray-800 flex justify-between items-center">
                                    <span>Chương {index + 1}: {chapter.title}</span>
                                    <span className="text-sm text-gray-500">{chapter.lessons?.length} bài học</span>
                                </div>
                                <div>
                                    {chapter.lessons?.map((lesson, lIndex) => (
                                        <div 
                                            key={lesson._id} 
                                            onClick={() => navigate(`/learning/${slug}/${lesson._id}`)}
                                            className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                                        >
                                            {lesson.type === 'video' ? (
                                                <PlayCircle size={16} className="text-gray-400 group-hover:text-blue-500" />
                                            ) : (
                                                <FileText size={16} className="text-gray-400 group-hover:text-blue-500" />
                                            )}
                                            <div className="flex-1">
                                                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                                                    {lesson.title}
                                                </span>
                                                {lesson.isFree && (
                                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Học thử</span>
                                                )}
                                            </div>
                                            {lesson.duration > 0 && (
                                                <span className="text-xs text-gray-400">{lesson.duration}p</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <div className="p-6 text-gray-500 text-center">Nội dung đang được cập nhật...</div>
                        )}
                    </div>

                    {/* Instructor */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6 font-heading text-gray-900">Giảng viên</h2>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start gap-6">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                                <User size={32} className="text-gray-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{course.instructor?.fullName || 'Daisy Team'}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Đội ngũ giảng viên, kiện tướng giàu kinh nghiệm tại Daisy Chess.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
