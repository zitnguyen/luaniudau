import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Lock, Award, Briefcase, GraduationCap, Save, Loader2 } from 'lucide-react';
import teacherService from '../../../services/teacherService';

const TeacherForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const formRef = useRef(null);
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
        experienceYears: '',
        certification: '',
        role: 'Teacher'
    });

    useEffect(() => {
        if (isEditMode) {
            fetchTeacher();
        }
    }, [id]);

    const fetchTeacher = async () => {
        try {
            setLoading(true);
            const response = await teacherService.getById(id);
            setFormData({
                username: String(response.username || ''),
                fullName: String(response.fullName || ''),
                email: String(response.email || ''),
                password: '',
                phone: String(response.phone || ''),
                specialization: String(response.specialization || ''),
                experienceYears: response.experienceYears ? String(response.experienceYears) : '',
                certification: String(response.certification || ''),
                role: response.role || 'Teacher'
            });
        } catch (err) {
            setError('Lỗi khi tải dữ liệu giáo viên');
            console.error('Error fetching teacher:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        const usernameStr = String(formData.username || '').trim();
        const emailStr = String(formData.email || '').trim();
        const passwordStr = String(formData.password || '').trim();
        
        if (!usernameStr) {
            setError('Vui lòng nhập tên đăng nhập');
            return;
        }
        if (!String(formData.fullName || '').trim()) {
            setError('Vui lòng nhập họ và tên');
            return;
        }
        if (!emailStr) {
            setError('Vui lòng nhập email');
            return;
        }
        if (!isEditMode && !passwordStr) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }

        try {
            setSubmitting(true);
            const cleanData = {
                ...formData,
                username: formData.username?.trim(),
                email: formData.email?.trim(),
                fullName: formData.fullName?.trim(),
                phone: formData.phone?.trim(),
                specialization: formData.specialization?.trim(),
                certification: formData.certification?.trim()
            };

            if (isEditMode) {
                await teacherService.update(id, cleanData);
            } else {
                await teacherService.create(cleanData);
            }
            navigate('/teachers');
        } catch (err) {
            console.error('Error saving teacher:', err);
            setError(err.response?.data?.message || 'Lỗi khi lưu dữ liệu: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/teachers')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}</h1>
                        <p className="text-sm text-gray-500">
                            {isEditMode ? 'Cập nhật thông tin và chuyên môn của giáo viên' : 'Thêm giáo viên mới vào hệ thống'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Error & Form */}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                    {/* Account Info Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><User size={20}/></span>
                            Thông tin tài khoản
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Nhập tên đăng nhập"
                                    required
                                    className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="teacher@example.com"
                                        required
                                        className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>
                            {!isEditMode && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Nhập mật khẩu"
                                            required
                                            className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    {/* Personal Info Section */}
                     <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><Briefcase size={20}/></span>
                            Thông tin cá nhân & Chuyên môn
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Nhập họ và tên giáo viên"
                                        required
                                        className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="0912345678"
                                        className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên môn</label>
                                <div className="relative">
                                    <Award size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        placeholder="VD: Cờ Vua, Toán"
                                        className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Năm kinh nghiệm</label>
                                <input
                                    type="number"
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleChange}
                                    placeholder="VD: 5"
                                    className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Chứng chỉ</label>
                                <div className="relative">
                                    <GraduationCap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="certification"
                                        value={formData.certification}
                                        onChange={handleChange}
                                        placeholder="VD: FIDE Master"
                                        className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => navigate('/teachers')}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            <span>{submitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Thêm'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeacherForm;
