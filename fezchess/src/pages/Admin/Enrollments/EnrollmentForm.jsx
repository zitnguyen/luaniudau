import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, ChevronLeft, User, BookOpen, Calendar, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import enrollmentService from '../../../services/enrollmentService';
import studentService from '../../../services/studentService';
import classService from '../../../services/classService';

const EnrollmentForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        studentId: '',
        classId: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active',
        paymentStatus: 'pending',
        feeAmount: 0 // Optional, maybe fetch from class
    });

    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch master data (students, classes) and enrollment if edit mode
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [studentsRes, classesRes] = await Promise.all([
                    studentService.getAll(),
                    classService.getAll()
                ]);
                setStudents(studentsRes || []);
                setClasses(classesRes || []);

                if (isEditMode) {
                    const allEnrollments = await enrollmentService.getAll();
                    const enrollment = allEnrollments.find(e => e._id === id);
                    if (enrollment) {
                        setFormData({
                            studentId: enrollment.studentId?._id || enrollment.studentId || '',
                            classId: enrollment.classId?._id || enrollment.classId || '',
                            enrollmentDate: enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toISOString().split('T')[0] : '',
                            status: enrollment.status || 'active',
                            paymentStatus: enrollment.paymentStatus || 'pending',
                            feeAmount: enrollment.feeAmount || 0
                        });
                    } else {
                        setError('Không tìm thấy thông tin ghi danh');
                    }
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Lỗi khi tải dữ liệu. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (isEditMode) {
                await enrollmentService.update(id, formData);
            } else {
                await enrollmentService.create(formData);
            }
            navigate('/enrollments');
        } catch (err) {
            console.error("Error saving enrollment:", err);
            setError(err.response?.data?.message || 'Lỗi khi lưu thông tin');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                <Loader2 className="animate-spin mb-3 text-primary" size={40} />
                <span className="font-medium">Đang tải thông tin form...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-6">
                <button 
                    onClick={() => navigate('/enrollments')} 
                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors mb-4 text-sm font-medium"
                >
                    <ChevronLeft size={18} />
                    Quay lại danh sách
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? 'Chỉnh Sửa Ghi Danh' : 'Tạo Ghi Danh Mới'}
                </h1>
                <p className="text-gray-500 mt-1">Điền thông tin bên dưới để {isEditMode ? 'cập nhật' : 'đăng ký'} khóa học cho học viên.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {error && (
                    <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-full flex-shrink-0">
                            <X size={18} />
                        </div>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                    {/* Section 1: Thông tin chính */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <User className="text-primary" size={20} />
                            <h3 className="font-semibold text-gray-900">Thông tin đăng ký</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Học Viên <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    name="studentId" 
                                    value={formData.studentId} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={isEditMode}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <option value="">-- Chọn học viên --</option>
                                    {students.map(s => (
                                        <option key={s._id} value={s._id}>
                                            {s.studentId ? `[${s.studentId}] ` : ''}{s.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Lớp Học <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    name="classId" 
                                    value={formData.classId} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="">-- Chọn lớp học --</option>
                                    {classes.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.className} ({c.schedule})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Ngày Ghi Danh <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        name="enrollmentDate" 
                                        value={formData.enrollmentDate} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Học Phí (VNĐ)
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        name="feeAmount" 
                                        value={formData.feeAmount} 
                                        onChange={handleChange} 
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                                        placeholder="0"
                                    />
                                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Trạng thái */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <CheckCircle className="text-primary" size={20} />
                            <h3 className="font-semibold text-gray-900">Trạng thái</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Trạng Thái Học
                                </label>
                                <select 
                                    name="status" 
                                    value={formData.status} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="active">Đang học</option>
                                    <option value="completed">Đã hoàn thành</option>
                                    <option value="dropped">Đã nghỉ</option>
                                    <option value="reserved">Bảo lưu</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Trạng Thái Thanh Toán
                                </label>
                                <select 
                                    name="paymentStatus" 
                                    value={formData.paymentStatus} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="pending">Chờ thanh toán</option>
                                    <option value="paid">Đã thanh toán</option>
                                    <option value="overdue">Quá hạn</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={() => navigate('/enrollments')}
                            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 font-medium transition-all flex items-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {submitting ? 'Đang lưu...' : 'Lưu thông tin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EnrollmentForm;
