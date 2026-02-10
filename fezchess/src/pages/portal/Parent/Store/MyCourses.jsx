import React, { useState, useEffect } from "react";
import orderService from "../../../services/orderService";
import { PlayCircle } from "lucide-react";

const MyCourses = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            const res = await orderService.getMyOrders();
            // Filter only Paid orders? Or allow Pending to see info?
            // Usually only Paid ones grant access.
            setOrders(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Khóa Học Của Tôi</h1>

            {loading ? (
                <div>Đang tải...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map(order => {
                        const product = order.productId;
                        if (!product) return null; // Handle deleted products
                        
                        const isPaid = order.status === 'Paid'; // Mock logic. Currently defaults to 'Pending' in controller unless updated.

                        return (
                            <div key={order._id} className="bg-white shadow rounded-lg overflow-hidden border">
                                <div className="aspect-video bg-gray-200 relative">
                                    {product.thumbnailUrl && <img src={product.thumbnailUrl} className="w-full h-full object-cover" />}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        {!isPaid ? (
                                            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">Chờ thanh toán</span>
                                        ) : (
                                            <button onClick={() => setSelectedVideo(product)} className="bg-white text-blue-600 rounded-full p-3 shadow-lg hover:scale-110 transition">
                                                <PlayCircle size={32} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-2">{product.title}</h3>
                                    <p className="text-sm text-gray-500 mb-2">Giá: {order.amount.toLocaleString()}đ</p>
                                    <p className="text-sm text-gray-500">Ngày mua: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                        )
                    })}
                    {orders.length === 0 && (
                        <div className="col-span-3 text-center py-10 text-gray-500">
                            Bạn chưa đăng ký khóa học nào. <a href="/store" className="text-blue-600 underline">Xem cửa hàng</a>
                        </div>
                    )}
                </div>
            )}

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                    <div className="bg-black w-full max-w-4xl rounded-lg overflow-hidden relative">
                         <button 
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-4 right-4 text-white z-10 bg-gray-800 rounded-full p-2"
                         >
                            ✕
                         </button>
                         <h2 className="text-white text-xl font-bold p-4 bg-gray-900">{selectedVideo.title}</h2>
                         <div className="aspect-video">
                            {/* Simple Logic: Check if it's youtube or mp4 */}
                            {selectedVideo.videoUrl.includes('youtube') ? (
                                <iframe 
                                    className="w-full h-full"
                                    src={selectedVideo.videoUrl.replace("watch?v=", "embed/")} 
                                    title="Video Player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <video controls className="w-full h-full" src={selectedVideo.videoUrl}></video>
                            )}
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCourses;
