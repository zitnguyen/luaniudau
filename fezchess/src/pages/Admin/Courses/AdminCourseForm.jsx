import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import courseService from '../../../services/courseService';
import { Save, ArrowLeft, Layout, List } from 'lucide-react';
import ChapterManager from './components/ChapterManager';

const AdminCourseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'curriculum'
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');
    
    // Basic Info State
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        price: 0,
        salePrice: 0,
        level: 'All Levels',
        category: 'General',
        thumbnail: '',
        isPublished: false
    });

    useEffect(() => {
        if (isEditMode) {
            fetchCourse();
        }
    }, [id]);

    const fetchCourse = async () => {
        try {
            setFetching(true);
            setError('');
            const data = await courseService.getCourseById(id);
            setFormData({
                title: data?.title ?? '',
                slug: data?.slug ?? '',
                description: data?.description ?? '',
                price: data?.price ?? 0,
                salePrice: data?.salePrice ?? 0,
                level: data?.level ?? 'All Levels',
                category: data?.category ?? 'General',
                thumbnail: data?.thumbnail ?? '',
                isPublished: Boolean(data?.isPublished)
            });

        } catch (error) {
            console.error("Error fetching course:", error);
            setError(error?.response?.data?.message || "Không thể tải dữ liệu khóa học.");
        } finally {
            setFetching(false);
        }
    };

    const generateSlug = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: !isEditMode ? generateSlug(title) : prev.slug
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            let response;
            if (isEditMode) {
                response = await courseService.updateCourse(id, formData);
                alert("Cập nhật thành công!");
            } else {
                response = await courseService.createCourse(formData);
                alert("Tạo khóa học thành công! Chuyển sang thêm bài học.");
                navigate(`/admin/courses/${response._id}/edit`);
                setActiveTab('curriculum');
            }
        } catch (error) {
            console.error("Error saving course:", error);
            const message = error.response?.data?.message || error.message || "Lỗi khi lưu khóa học";
            setError(message);
            alert("Lỗi khi lưu khóa học: " + message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/courses')} className="text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? `Chỉnh Sửa: ${formData.title}` : 'Tạo Khóa Học Mới'}
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Only show Save button on Info tab or allow global save? separate saves is easier */}
                    {activeTab === 'info' && (
                        <button 
                            onClick={handleSubmit} 
                            disabled={loading || fetching}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Save className="w-5 h-5" />
                            {isEditMode ? 'Cập Nhật' : 'Tạo Mới'}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {fetching && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Đang tải dữ liệu khóa học...
                </div>
            )}

            {/* Tabs */}
            <div className="flex mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-100 max-w-md">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2 ${
                        activeTab === 'info' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Layout className="w-4 h-4" />
                    Thông Tin Cơ Bản
                </button>
                <button
                    onClick={() => {
                        if (!isEditMode) {
                            alert("Vui lòng lưu thông tin khóa học trước khi thêm bài học.");
                            return;
                        }
                        setActiveTab('curriculum');
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2 ${
                        activeTab === 'curriculum' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <List className="w-4 h-4" />
                    Chương Trình Học
                </button>
            </div>

            {/* Content */}
            {activeTab === 'info' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-lg"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                                <textarea
                                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary min-h-[200px]"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Settings */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Cài Đặt</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                />
                            </div>
                             <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi (VNĐ)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                    value={formData.salePrice}
                                    onChange={(e) => setFormData({...formData, salePrice: Number(e.target.value)})}
                                />
                            </div>
                             <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select 
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                    value={formData.isPublished ? 'true' : 'false'}
                                    onChange={(e) => setFormData({...formData, isPublished: e.target.value === 'true'})}
                                >
                                    <option value="false">Bản nháp</option>
                                    <option value="true">Công khai</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
                                <select 
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                    value={formData.level}
                                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                                >
                                    <option value="Beginner">Cơ bản (Beginner)</option>
                                    <option value="Intermediate">Trung cấp (Intermediate)</option>
                                    <option value="Advanced">Nâng cao (Advanced)</option>
                                    <option value="All Levels">Mọi cấp độ</option>
                                </select>
                            </div>
                             <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                                <select 
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="General">Tổng quát</option>
                                    <option value="Opening">Khai cuộc</option>
                                    <option value="Strategy">Chiến lược</option>
                                    <option value="Tactics">Chiến thuật</option>
                                    <option value="Endgame">Cờ tàn</option>
                                </select>
                            </div>
                        </div>

                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                             <h3 className="font-bold text-gray-900 mb-4">Hình Ảnh</h3>
                             <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL Ảnh thu nhỏ</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                    value={formData.thumbnail}
                                    onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                                    placeholder="https://..."
                                />
                             </div>
                             {formData.thumbnail && (
                                 <img src={formData.thumbnail} alt="Preview" className="w-full rounded-lg mt-2 border border-gray-100" />
                             )}
                         </div>
                    </div>
                </div>
            ) : (
                <ChapterManager courseId={id} />
            )}
        </div>
    );
};

export default AdminCourseForm;
