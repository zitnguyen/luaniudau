import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import postService from '../../services/postService';
import { Calendar, User, ArrowRight } from 'lucide-react';

const NewsPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

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
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Tin Tức & Sự Kiện</h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Cập nhật những thông tin mới nhất về các giải đấu, hoạt động của câu lạc bộ và kiến thức cờ vua bổ ích.
                </p>
            </div>

            {loading ? (
                <div className="text-center py-20">Đang tải tin tức...</div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <div key={post._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col h-full">
                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                {post.thumbnail ? (
                                    <img 
                                        src={post.thumbnail} 
                                        alt={post.title} 
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary">
                                    {post.category}
                                </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4">
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span className="flex items-center">
                                        <User className="w-4 h-4 mr-1" />
                                        {post.author?.fullName || 'Admin'}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-primary transition-colors">
                                    <Link to={`/news/${post.slug || post._id}`}>
                                        {post.title}
                                    </Link>
                                </h3>
                                
                                <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-1">
                                    {post.summary || "Xem chi tiết để đọc nội dung bài viết..."}
                                </p>
                                
                                <Link 
                                    to={`/news/${post.slug || post._id}`}
                                    className="inline-flex items-center font-semibold text-primary hover:text-primary/80 mt-auto group"
                                >
                                    Xem chi tiết
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <p className="text-gray-500 text-lg">Chưa có tin tức nào được đăng tải.</p>
                </div>
            )}
        </div>
    );
};

export default NewsPage;
