import React, { useState, useEffect } from 'react';
import parentService from '../../../services/parentService';
import authService from '../../../services/authService';
import { User, Calendar, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSkillLevelLabel } from '../../../utils/studentLevel';

const ParentDashboard = () => {
    const user = authService.getCurrentUser();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChildren = async () => {
            if (user && user._id) {
                try {
                     // Check if user is parent
                     // If the logged in user is the parent, user._id is the parentId (User ID)
                     // Backend: getParentStudents(req.params.id) -> Student.find({ parentId: id })
                     const res = await parentService.getStudents(user._id);
                     setChildren(res);
                } catch (error) {
                    console.error("Failed to fetch children", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchChildren();
    }, [user]);

    if (loading) return <div className="p-8 text-center">Đang tải thông tin...</div>;

    return (
        <div className="p-6">
             <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Xin chào, {user?.fullName || 'Quý phụ huynh'} 👋</h1>
                <p className="text-gray-600">Quản lý việc học của các con tại đây.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.length > 0 ? children.map(child => (
                    <div key={child._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <User size={24} />
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                    {getSkillLevelLabel(child.skillLevel)}
                                </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{child.fullName}</h3>
                            <p className="text-sm text-gray-500 mb-4">{new Date(child.dateOfBirth).toLocaleDateString('vi-VN')}</p>
                            
                            <div className="border-t border-gray-100 pt-4 flex gap-2">
                                <Link 
                                    to={`/parent/schedule?studentId=${child._id}`}
                                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Calendar size={16} />
                                    Lịch học
                                </Link>
                                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                    <BookOpen size={16} />
                                    Kết quả
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                         <p className="text-gray-500 mb-4">Chưa có thông tin học viên nào được liên kết.</p>
                         <p className="text-sm text-gray-400">Vui lòng liên hệ trung tâm để cập nhật hồ sơ.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentDashboard;
