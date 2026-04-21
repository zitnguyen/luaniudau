import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import { ArrowLeft, PlayCircle, FileText } from 'lucide-react';

const LearningPage = () => {
    const { courseSlug, lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                // If we also want the full course context, we might need to fetch the course too
                // For now, let's just fetch the lesson
                const res = await courseService.getLessonById(lessonId);
                setLesson(res);
            } catch (error) {
                console.error("Failed to fetch lesson", error);
                if (error?.response?.status === 403) {
                    alert(error?.response?.data?.message || "Bạn không có quyền xem bài học này.");
                    navigate(`/courses/${courseSlug}`);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [lessonId]);

    if (loading) return <div className="text-center py-20 text-white bg-gray-900 min-h-screen">Đang tải bài học...</div>;
    if (!lesson) return <div className="text-center py-20 text-white bg-gray-900 min-h-screen">Không tìm thấy bài học.</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="flex items-center px-6 py-4 border-b border-gray-800 bg-gray-900">
                <button 
                    onClick={() => navigate(`/courses/${courseSlug}`)}
                    className="flex items-center text-gray-400 hover:text-white transition-colors mr-6"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Quay lại khóa học
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold truncate">{lesson.title}</h1>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto p-8 flex justify-center">
                <div className="w-full max-w-4xl">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl mb-8 relative">
                        {lesson.type === 'video' && lesson.content ? (
                            lesson.content.includes('youtube') || lesson.content.includes('youtu.be') ? (
                                <iframe 
                                    src={lesson.content.replace('watch?v=', 'embed/')} 
                                    className="w-full h-full" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <video controls className="w-full h-full">
                                    <source src={lesson.content} type="video/mp4" />
                                    Trình duyệt của bạn không hỗ trợ video tag.
                                </video>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full text-gray-500">
                                <FileText size={64} className="mb-4 opacity-50" />
                                <p>Bài học này là dạng văn bản hoặc không có video.</p>
                            </div>
                        )}
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <h2 className="text-2xl font-bold mb-4">Nội dung bài học</h2>
                        {lesson.type !== 'video' && (
                            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                        )}
                        {lesson.description && <p>{lesson.description}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearningPage;
