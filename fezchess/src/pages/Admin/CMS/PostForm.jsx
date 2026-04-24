import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import { Save, ArrowLeft, ImagePlus, Loader2 } from 'lucide-react';
import postService from '../../../services/postService';

const PostForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        summary: '',
        content: '',
        thumbnail: '',
        images: [],
        category: 'News',
        isPublished: false
    });

    useEffect(() => {
        if (isEditMode) {
            fetchPost();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const data = await axiosClient.get(`/posts/${id}`);
            setFormData({
                title: data.title,
                slug: data.slug,
                summary: data.summary || '',
                content: data.content,
                thumbnail: data.thumbnail || '',
                images: Array.isArray(data.images) ? data.images : (data.thumbnail ? [data.thumbnail] : []),
                category: data.category || 'News',
                isPublished: data.isPublished
            });
        } catch (error) {
            console.error("Error loading post:", error);
            alert("Không thể tải bài viết");
            navigate('/cms/posts');
        }
    };

    const generateSlug = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
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

        try {
            const normalizedImages = Array.isArray(formData.images)
                ? formData.images.map((url) => String(url || "").trim()).filter(Boolean)
                : [];
            const payload = {
                ...formData,
                images: normalizedImages,
                thumbnail: formData.thumbnail || normalizedImages[0] || '',
            };
            if (isEditMode) {
                await axiosClient.put(`/posts/${id}`, payload);
                alert("Cập nhật thành công!");
            } else {
                await axiosClient.post('/posts', payload);
                alert("Tạo bài viết mới thành công!");
            }
            navigate('/cms/posts');
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Lỗi khi lưu bài viết: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handlePickThumbnail = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            setUploadingImages(true);
            const uploadedUrl = await postService.uploadImage(file);
            if (!uploadedUrl) throw new Error("Không lấy được URL ảnh");
            setFormData((prev) => ({
                ...prev,
                thumbnail: uploadedUrl,
                images: Array.isArray(prev.images) && prev.images.length > 0
                    ? [uploadedUrl, ...prev.images.filter((img) => img !== uploadedUrl)]
                    : [uploadedUrl],
            }));
        } catch (error) {
            alert(error?.response?.data?.message || error.message || "Upload ảnh thất bại.");
        } finally {
            setUploadingImages(false);
            event.target.value = "";
        }
    };

    const handlePickGalleryImages = async (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;
        try {
            setUploadingImages(true);
            const uploadedUrls = [];
            for (const file of files) {
                // eslint-disable-next-line no-await-in-loop
                const uploadedUrl = await postService.uploadImage(file);
                if (uploadedUrl) uploadedUrls.push(uploadedUrl);
            }
            if (uploadedUrls.length > 0) {
                setFormData((prev) => {
                    const current = Array.isArray(prev.images) ? prev.images : [];
                    const merged = [...current, ...uploadedUrls];
                    return {
                        ...prev,
                        images: merged,
                        thumbnail: prev.thumbnail || merged[0] || '',
                    };
                });
            }
        } catch (error) {
            alert(error?.response?.data?.message || error.message || "Upload ảnh thất bại.");
        } finally {
            setUploadingImages(false);
            event.target.value = "";
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <button 
                onClick={() => navigate('/cms/posts')} 
                className="flex items-center text-gray-500 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại danh sách
            </button>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? 'Chỉnh Sửa Bài Viết' : 'Viết Bài Mới'}
                </h1>
                <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
                >
                    <Save className="w-5 h-5" />
                    {loading ? 'Đang lưu...' : (isEditMode ? 'Cập Nhật' : 'Đăng Bài')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài viết</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-lg font-medium"
                                placeholder="Nhập tiêu đề..."
                                value={formData.title}
                                onChange={handleTitleChange}
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn (Slug)</label>
                            <input
                                type="text"
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 focus:outline-none focus:border-primary"
                                value={formData.slug}
                                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                            <textarea
                                className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary min-h-[400px]"
                                placeholder="Viết nội dung bài viết ở đây (Hỗ trợ HTML cơ bản)..."
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-2 text-right">Hỗ trợ Markdown hoặc HTML</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Cài Đặt Bài Viết</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select 
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                value={formData.isPublished ? 'true' : 'false'}
                                onChange={(e) => setFormData({...formData, isPublished: e.target.value === 'true'})}
                            >
                                <option value="false">Nháp (Draft)</option>
                                <option value="true">Công khai (Published)</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                            <select 
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="News">Tin tức & Sự kiện</option>
                                <option value="Education">Góc Học Tập</option>
                                <option value="Tournament">Giải Đấu</option>
                                <option value="Admission">Tuyển Sinh</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                         <h3 className="font-bold text-gray-900 mb-4">Hình Ảnh & Tóm Tắt</h3>
                         
                         <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện (URL)</label>
                            <div className="mb-2">
                                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                                    {uploadingImages ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <ImagePlus size={16} />
                                    )}
                                    <span className="text-sm">
                                        {uploadingImages ? "Đang upload..." : "Tải ảnh đại diện từ máy"}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg"
                                        className="hidden"
                                        onChange={handlePickThumbnail}
                                    />
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                    placeholder="https://..."
                                    value={formData.thumbnail}
                                    onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                                />
                            </div>
                            {formData.thumbnail && (
                                <div className="mt-2 text-center bg-gray-50 p-2 rounded-lg">
                                    <img src={formData.thumbnail} alt="Preview" className="max-h-32 mx-auto rounded" />
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Danh sách ảnh (nhiều URL)</label>
                            <div className="mb-2">
                                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                                    {uploadingImages ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <ImagePlus size={16} />
                                    )}
                                    <span className="text-sm">
                                        {uploadingImages ? "Đang upload..." : "Tải nhiều ảnh từ máy"}
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/png,image/jpeg"
                                        className="hidden"
                                        onChange={handlePickGalleryImages}
                                    />
                                </label>
                            </div>
                            <div className="space-y-2">
                                {(formData.images || []).map((img, idx) => (
                                    <div key={`img-${idx}`} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                            placeholder="https://..."
                                            value={img}
                                            onChange={(e) => {
                                                const nextImages = [...(formData.images || [])];
                                                nextImages[idx] = e.target.value;
                                                setFormData({ ...formData, images: nextImages });
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg"
                                            onClick={() => {
                                                const nextImages = (formData.images || []).filter((_, i) => i !== idx);
                                                setFormData({ ...formData, images: nextImages });
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg"
                                    onClick={() =>
                                        setFormData({ ...formData, images: [...(formData.images || []), ""] })
                                    }
                                >
                                    + Thêm ảnh
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt ngắn</label>
                            <textarea
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary h-24 text-sm"
                                placeholder="Mô tả ngắn gọn về bài viết..."
                                value={formData.summary}
                                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostForm;
