import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import postService from '../../services/postService';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { usePublicCms } from '../../context/PublicCmsContext';
import PublicPageQuickEditor from "../../components/cms/PublicPageQuickEditor";

const NewsPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cms } = usePublicCms();
    const page = cms?.newsPage || {};

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetch published posts
                const response = await postService.getPublishedPosts({ limit: 20 }); 
                // Backend controller might return array directly or { posts: [] }
                // Based on universal crud test, GET /posts returned array.
                // But NewsPage code expects response.posts. 
                // Let's assume response IS the array if service returns data directly.
                // However, let's be safe and check.
                // If backend returns array: setPosts(response.filter(...))
                const data = Array.isArray(response) ? response : (response.posts || []);
                setPosts(data.filter(p => p.isPublished));
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="bg-white" style={{ backgroundColor: page?.pageBackgroundColor || "#FFFFFF", fontFamily: page?.fontFamily && page.fontFamily !== "inherit" ? page.fontFamily : undefined }}>
            <div
              className="py-20"
              style={{
                backgroundColor: page?.heroBackground ? undefined : "#F9FAFB",
                backgroundImage: page?.heroBackground ? `url(${page.heroBackground})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl font-bold mb-4" style={{ color: page?.titleColor || "#111827", fontSize: page?.titleFontSize || undefined }}>{page?.title || "Tin Tức & Sự Kiện"}</h1>
                <p className="text-lg max-w-2xl mx-auto" style={{ color: page?.descriptionColor || "#4B5563", fontSize: page?.descriptionFontSize || undefined }}>
                    {page?.description || "Cập nhật những thông tin mới nhất về các giải đấu, hoạt động của câu lạc bộ và kiến thức cờ vua bổ ích."}
                </p>
              </div>
            </div>

            <div className="container mx-auto px-4 py-12">

            {loading ? (
                <div className="text-center py-20">Đang tải tin tức...</div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => {
                        const previewImage = post.thumbnail || (Array.isArray(post.images) ? post.images[0] : "");
                        return (
                        <div key={post._id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 dark:border-slate-700 flex flex-col h-full">
                            <div className="aspect-video bg-gray-100 dark:bg-slate-800 relative overflow-hidden">
                                {previewImage ? (
                                    <img 
                                        src={previewImage}
                                        alt={post.title} 
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-300">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary dark:text-white border border-white/20 dark:border-slate-600">
                                    {post.category}
                                </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center text-xs text-gray-500 dark:text-slate-300 mb-3 space-x-4">
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" style={{ color: page?.iconColor || undefined }} />
                                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span className="flex items-center">
                                        <User className="w-4 h-4 mr-1" style={{ color: page?.iconColor || undefined }} />
                                        {post.author?.fullName || 'Admin'}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-primary dark:hover:text-blue-300 transition-colors">
                                    <Link to={`/news/${post.slug || post._id}`}>
                                        {post.title}
                                    </Link>
                                </h3>
                                
                                <p className="text-gray-600 dark:text-slate-300 mb-4 line-clamp-3 text-sm flex-1">
                                    {post.summary || "Xem chi tiết để đọc nội dung bài viết..."}
                                </p>
                                
                                <Link 
                                    to={`/news/${post.slug || post._id}`}
                                    className="inline-flex items-center font-semibold dark:text-blue-300 hover:text-primary/80 mt-auto group"
                                    style={{ color: page?.buttonColor || undefined }}
                                >
                                    Xem chi tiết
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" style={{ color: page?.iconColor || undefined }} />
                                </Link>
                            </div>
                        </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <p className="text-gray-500 text-lg">Chưa có tin tức nào được đăng tải.</p>
                </div>
            )}
            </div>
            <PublicPageQuickEditor
              title="Chỉnh giao diện Tin tức"
              fields={[
                { path: "newsPage.title", label: "Tiêu đề trang" },
                { path: "newsPage.description", label: "Mô tả trang", type: "textarea" },
                { path: "newsPage.buttonColor", label: "Màu nút/link", type: "color" },
                { path: "newsPage.buttonTextColor", label: "Màu chữ nút", type: "color" },
                { path: "newsPage.iconColor", label: "Màu icon", type: "color" },
                { path: "newsPage.pageBackgroundColor", label: "Màu nền trang", type: "color" },
                { path: "newsPage.titleColor", label: "Màu tiêu đề", type: "color" },
              ]}
            />
        </div>
    );
};

export default NewsPage;
