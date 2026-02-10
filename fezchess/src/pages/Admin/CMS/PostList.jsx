import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';

const PostList = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axiosClient.get('/posts?limit=100'); // Get all for admin usually, or implement pagination
            setPosts(response.posts || []);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
            try {
                await axiosClient.delete(`/posts/${id}`);
                setPosts(posts.filter(post => post._id !== id));
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Lỗi khi xóa bài viết");
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản Lý Tin Tức</h1>
                    <p className="text-gray-500">Đăng tải và quản lý các bài viết, thông báo</p>
                </div>
                <button 
                    onClick={() => navigate('/cms/posts/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Viết Bài Mới
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tiêu Đề</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Danh Mục</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tác Giả</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Trạng Thái</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Ngày Tạo</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Đang tải...</td></tr>
                            ) : posts.length > 0 ? (
                                posts.map((post) => (
                                    <tr key={post._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                                            {post.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                                {post.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {post.author?.fullName || "Admin"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                post.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {post.isPublished ? 'Đã đăng' : 'Nháp'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/cms/posts/${post._id}/edit`)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(post._id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        Chưa có bài viết nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PostList;
