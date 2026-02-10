import React, { useState, useEffect } from 'react';
import axiosClient from '../../../../api/axiosClient';
import { Plus, GripVertical, Edit2, Trash, ChevronDown, ChevronRight, Video, FileText } from 'lucide-react';
import LessonManager from './LessonManager';

const ChapterManager = ({ courseId }) => {
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [expandedChapter, setExpandedChapter] = useState(null);

    useEffect(() => {
        fetchCurriculum();
    }, [courseId]);

    const fetchCurriculum = async () => {
        if (!courseId) return;
        try {
            // Reusing getCourseBySlug logic but adapted.
            // Ideally we need GET /courses/:id/curriculum
            // But let's use the full course endpoint and extract curriculum.
             const response = await axiosClient.get(`/courses/${courseId}`);
             // If response structure matches courseController.getCourseBySlug: { course, curriculum: [...] }
             if (response.curriculum) {
                 setChapters(response.curriculum);
             } else {
                 setChapters([]);
             }
        } catch (error) {
            console.error("Error fetching curriculum:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddChapter = async () => {
        if (!newChapterTitle.trim()) return;
        try {
            // Need POST /courses/:id/chapters or /chapters with courseId
            // Checking chapterRoutes.js... 
            // Routes: POST / (create chapter), GET / (get all?), PUT /:id, DELETE /:id
            // Controller: addChapter expects { title, order, courseId: params.courseId } ??
            // courseController.addChapter is what I saw earlier, but is it mounted at /courses/:id/chapters?
            // server.js: app.use("/api/courses", courseRoutes);
            // server.js: app.use("/api/chapters", chapterRoutes);
            
            // Let's check courseRoutes.js later. Assuming standard REST:
            // Safest: POST /chapters with courseId in body if independent, OR POST /courses/:id/chapters
            
            // Based on server.js: app.use("/api/chapters", chapterRoutes);
            // And chapterRoutes likely has create.
            // Let's try POST /chapters with courseId.
            
            await axiosClient.post('/chapters', { 
                title: newChapterTitle, 
                courseId: courseId,
                order: chapters.length + 1 
            });
            
            setNewChapterTitle('');
            setIsAdding(false);
            fetchCurriculum(); // Refresh
        } catch (error) {
            console.error("Error adding chapter:", error);
            alert("Lỗi thêm chương mới");
        }
    };

    const deleteChapter = async (chapterId) => {
        if (!window.confirm("Xóa chương này sẽ xóa toàn bộ bài học bên trong?")) return;
        try {
            await axiosClient.delete(`/chapters/${chapterId}`);
            fetchCurriculum();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Cấu trúc khóa học</h3>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Thêm Chương Mới
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm flex gap-3 animate-in fade-in slide-in-from-top-2">
                    <input 
                        type="text" 
                        autoFocus
                        placeholder="Nhập tên chương (VD: Chương 1 - Khai cuộc)..."
                        className="flex-1 p-2 border border-gray-300 rounded focus:border-primary focus:outline-none"
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
                    />
                    <button 
                        onClick={handleAddChapter}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                    >
                        Lưu
                    </button>
                    <button 
                        onClick={() => setIsAdding(false)}
                        className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded"
                    >
                        Hủy
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {chapters.map((chapter, index) => (
                    <div key={chapter._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Chapter Header */}
                        <div className="bg-gray-50 p-4 flex items-center justify-between group">
                            <div 
                                className="flex items-center gap-3 cursor-pointer select-none flex-1"
                                onClick={() => setExpandedChapter(expandedChapter === chapter._id ? null : chapter._id)}
                            >
                                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                                {expandedChapter === chapter._id ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                                <h4 className="font-bold text-gray-800 text-lg">
                                    {chapter.title}
                                    <span className="text-xs text-gray-400 font-normal ml-3">({chapter.lessons?.length || 0} bài học)</span>
                                </h4>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => deleteChapter(chapter._id)}
                                    className="p-2 text-gray-500 hover:text-red-600 rounded hover:bg-red-50"
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Lessons List (Expanded) */}
                        {expandedChapter === chapter._id && (
                            <div className="p-4 border-t border-gray-100 bg-white">
                                <LessonManager 
                                    chapterId={chapter._id} 
                                    courseId={courseId}
                                    lessons={chapter.lessons || []}
                                    onUpdate={fetchCurriculum}
                                />
                            </div>
                        )}
                    </div>
                ))}

                {chapters.length === 0 && !loading && !isAdding && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                        Chưa có chương nào. Hãy thêm chương mới để bắt đầu.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChapterManager;
