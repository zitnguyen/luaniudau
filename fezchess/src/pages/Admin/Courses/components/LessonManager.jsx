import React, { useState } from 'react';
import axiosClient from '../../../../api/axiosClient';
import { Plus, Video, FileText, Play, Trash2, Edit } from 'lucide-react';

const LessonManager = ({ chapterId, courseId, lessons, onUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'video',
        content: '', // URL or text
        duration: 0,
        isFree: false
    });

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            await axiosClient.post('/lessons', {
                ...formData,
                chapterId,
                courseId,
                order: lessons.length + 1
            });
            setIsAdding(false);
            setFormData({ title: '', type: 'video', content: '', duration: 0, isFree: false });
            onUpdate();
        } catch (error) {
            console.error("Error adding lesson:", error);
            alert("Lỗi thêm bài học");
        }
    };

    const handleDelete = async (lessonId) => {
        if (!window.confirm("Xóa bài học này?")) return;
        try {
            await axiosClient.delete(`/lessons/${lessonId}`);
            onUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-3 pl-4 border-l-2 border-gray-100 ml-2">
            {lessons.map((lesson) => (
                <div key={lesson._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 group transition-colors">
                    <div className="flex items-center gap-3">
                        {lesson.type === 'video' ? <Video className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-green-500" />}
                        <span className="text-sm font-medium text-gray-700">{lesson.title}</span>
                        {lesson.isFree && <span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Học thử</span>}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-xs text-gray-400 mr-2">{lesson.duration}p</span>
                         <button onClick={() => handleDelete(lesson._id)} className="text-gray-400 hover:text-red-600">
                             <Trash2 className="w-4 h-4" />
                         </button>
                    </div>
                </div>
            ))}

            {isAdding ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-blue-100 mt-2">
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            className="w-full p-2 text-sm border rounded focus:border-primary focus:outline-none"
                            placeholder="Tên bài học..."
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                        <div className="flex gap-2">
                             <select 
                                className="p-2 text-sm border rounded"
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value})}
                             >
                                 <option value="video">Video</option>
                                 <option value="text">Bài đọc</option>
                             </select>
                             <input 
                                type="text" 
                                className="flex-1 p-2 text-sm border rounded"
                                placeholder={formData.type === 'video' ? "URL Video (Youtube/Vimeo)..." : "Nội dung bài học..."}
                                value={formData.content}
                                onChange={e => setFormData({...formData, content: e.target.value})}
                             />
                        </div>
                        <div className="flex items-center gap-4">
                            <input 
                                type="number" 
                                className="w-24 p-2 text-sm border rounded"
                                placeholder="Phút"
                                value={formData.duration}
                                onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                            />
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isFree}
                                    onChange={e => setFormData({...formData, isFree: e.target.checked})}
                                />
                                Cho phép học thử
                            </label>
                            <div className="flex-1 flex justify-end gap-2">
                                <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-200 rounded">Hủy</button>
                                <button onClick={handleSubmit} className="px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-primary/90">Lưu Bài Học</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 text-sm text-primary font-medium hover:underline mt-2 px-2"
                >
                    <Plus className="w-4 h-4" />
                    Thêm bài học
                </button>
            )}
        </div>
    );
};

export default LessonManager;
