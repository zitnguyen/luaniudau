import React, { useState, useEffect } from 'react';
import orderService from '../../../services/orderService';
import { PlayCircle, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyCourses = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user) {
            fetchMyCourses();
        }
    }, []);

    const fetchMyCourses = async () => {
        try {
            const res = await orderService.getMyOrders();
            setOrders(Array.isArray(res) ? res : []);
        } catch (error) {
            console.error("Failed to fetch my courses", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 font-heading text-gray-800">Khóa học của tôi</h1>
            
            {loading ? (
                <div>Đang tải...</div>
            ) : (
                orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="text-blue-500" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Bạn chưa đăng ký khóa học nào</h3>
                        <p className="text-gray-500 mb-6">Khám phá các khóa học video để nâng cao trình độ cờ vua ngay hôm nay.</p>
                        <Link to="/courses" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            Xem khóa học
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {orders.flatMap((order) => (order.items || []).map((item) => ({
                            orderId: order._id,
                            course: item.courseId,
                        }))).map((entry, index) => (
                            <div key={`${entry.orderId}-${entry.course?._id || index}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <div className="flex items-start gap-3">
                                    <PlayCircle className="text-blue-500 mt-0.5" size={20} />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {entry.course?.title || "Khóa học"}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {entry.course?.description || "Khóa học đã đăng ký"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default MyCourses;
