import React, { useState, useEffect } from 'react';
import courseService from '../../services/courseService';
// import orderService from '../../services/orderService'; // Will be used in Detail page or cart
import { PlayCircle, User, Search, Filter } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const CourseStorePage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        level: ''
    });

    useEffect(() => {
        fetchCourses();
    }, [filters.category, filters.level]); // Debounce search in real app

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await courseService.getPublishedCourses(filters);
            setCourses(res);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setFilters({ ...filters, search: e.target.value });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchCourses();
    };

    const categories = ["Opening", "Strategy", "Tactics", "Endgame", "General"];
    const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
             {/* Header Section */}
             <div className="bg-blue-900 text-white py-16 text-center mb-8">
                  <h1 className="text-4xl font-bold mb-4 font-heading">KHO KHÓA HỌC VIDEO</h1>
                  <p className="text-xl opacity-90 max-w-2xl mx-auto">
                      Hệ thống bài giảng chất lượng cao, giúp bạn làm chủ bàn cờ từ Khai cuộc đến Tàn cuộc.
                  </p>
             </div>

            <div className="max-w-7xl mx-auto px-6">
                
                {/* Search & Filter Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-1/3">
                            <input 
                                type="text" 
                                placeholder="Tìm khóa học..." 
                                className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.search}
                                onChange={handleSearchChange}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </form>

                        {/* Filters */}
                        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <select 
                                className="border rounded-md px-3 py-2 bg-white"
                                value={filters.category}
                                onChange={(e) => setFilters({...filters, category: e.target.value})}
                            >
                                <option value="">Tất cả Thể loại</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <select 
                                className="border rounded-md px-3 py-2 bg-white"
                                value={filters.level}
                                onChange={(e) => setFilters({...filters, level: e.target.value})}
                            >
                                <option value="">Tất cả Trình độ</option>
                                {levels.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Course Grid */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    <>
                        {courses.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                Không tìm thấy khóa học nào phù hợp.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {courses.map(course => (
                                    <Link to={`/courses/${course.slug}`} key={course._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block">
                                        <div className="relative h-48 bg-gray-200">
                                            {course.thumbnail ? (
                                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                                                    <PlayCircle size={48} className="opacity-50" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}
                                            </div>
                                            <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs">
                                                {course.level}
                                            </div>
                                        </div>
                                        
                                        <div className="p-5">
                                            <div className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                                                {course.category}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 h-14">
                                                {course.title}
                                            </h3>
                                            
                                            <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <User size={16} />
                                                    <span>{course.instructor?.fullName || 'Daisy Team'}</span>
                                                </div>
                                                {/* <div className="flex items-center gap-1 text-yellow-500">
                                                    <span>★</span> <span>4.8</span>
                                                </div> */}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CourseStorePage;
