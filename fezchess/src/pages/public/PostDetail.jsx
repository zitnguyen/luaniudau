import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import postService from '../../services/postService';
import { Calendar, User, Clock, ArrowLeft, Tag } from 'lucide-react';

const PostDetail = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await postService.getPostBySlug(slug);
                setPost(data);
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (loading) return <div className="text-center py-20">Đang tải bài viết...</div>;
    if (!post) return <div className="text-center py-20">Không tìm thấy bài viết.</div>;

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Link to="/news" className="inline-flex items-center text-gray-500 hover:text-primary mb-8 group transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Quay lại tin tức
            </Link>

            <article>
                <header className="mb-10 text-center">
                    <div className="flex justify-center gap-2 mb-4">
                         <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                            {post.category}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>
                    
                    <div className="flex items-center justify-center text-gray-500 space-x-6 text-sm">
                        <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {post.author?.fullName || 'Admin'}
                        </span>
                        <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {post.views} lượt xem
                        </span>
                    </div>
                </header>

                {post.thumbnail && (
                    <div className="mb-10 rounded-2xl overflow-hidden shadow-lg">
                        <img src={post.thumbnail} alt={post.title} className="w-full object-cover max-h-[500px]" />
                    </div>
                )}

                <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                {post.tags && post.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-100 flex items-center gap-3">
                        <Tag className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-500 font-medium">Tags:</span>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, idx) => (
                                <span key={idx} className="bg-gray-100 px-3 py-1 rounded-lg text-sm text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
};

export default PostDetail;
