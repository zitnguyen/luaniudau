import React, { useState, useEffect } from 'react';
import { Plus, Download, Search, Edit, Trash2, RotateCw, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import studentService from '../../../services/studentService';

const StudentList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch students
    useEffect(() => {
        fetchStudents();
    }, [location.pathname]);

    // Apply filters
    useEffect(() => {
        applyFilters();
    }, [students, searchTerm]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await studentService.getAll();
            setStudents(response || []);
        } catch (err) {
            setError('Lỗi khi tải dữ liệu học viên');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = students.filter(student => {
            const term = searchTerm.toLowerCase();
            return (
                (student.fullName && student.fullName.toLowerCase().includes(term)) ||
                (student.studentId && String(student.studentId).includes(term)) ||
                (student.address && student.address.toLowerCase().includes(term))
            );
        });
        setFilteredStudents(filtered);
    };

    const handleDelete = async (studentId) => {
        try {
            await studentService.delete(studentId);
            setStudents(students.filter(s => s._id !== studentId));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Error deleting student:', err);
            setError('Lỗi khi xóa học viên');
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchStudents();
        setIsRefreshing(false);
    };

    const handleExportExcel = () => {
        // ... (Export logic remains same, abstracted for brevity if needed)
        try {
            const headers = ['Mã HV', 'Tên', 'Ngày sinh', 'Địa chỉ', 'Ngày nhập học', 'Trình độ'];
            const rows = filteredStudents.map(student => [
                student.studentId || 'N/A',
                student.fullName || 'N/A',
                student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A',
                student.address || 'N/A',
                student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('vi-VN') : 'N/A',
                student.skillLevel || 'N/A'
            ]);
            const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (err) {
            setError('Lỗi khi xuất dữ liệu');
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Danh Sách Học Viên</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý toàn bộ thông tin học viên của trung tâm.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                    >
                        <RotateCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        <span>Cập nhật</span>
                    </button>
                    <button 
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                    >
                        <Download size={16} />
                        <span>Xuất Excel</span>
                    </button>
                    <button 
                        onClick={() => navigate('/students/new')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
                    >
                        <Plus size={16} />
                        <span>Thêm mới</span>
                    </button>
                </div>
            </div>

            {/* Controls & Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                        placeholder="Tìm kiếm theo tên, mã học viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Error Actions */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center justify-between"
                    >
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Học Viên</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã HV</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày sinh</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày nhập học</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trình độ</th>
                                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Hành động</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <RotateCw className="animate-spin text-primary" />
                                            <span>Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        Chưa có dữ liệu học viên.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                                        {(student.fullName || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900">{student.fullName}</div>
                                                    <div className="text-xs text-gray-500">{student.address || 'Chưa cập nhật'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                {student.studentId || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('vi-VN') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${student.skillLevel?.includes('Kid') ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                                {student.skillLevel || 'Chưa xếp hạng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => navigate(`/students/${student._id}/edit`)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setDeleteConfirm(student._id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    {deleteConfirm === student._id && (
                                                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50">
                                                            <p className="text-xs text-gray-700 mb-3 font-medium text-center">Xác nhận xóa học viên này?</p>
                                                            <div className="flex gap-2 justify-center">
                                                                <button 
                                                                    onClick={() => handleDelete(student._id)} 
                                                                    className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                                                                >
                                                                    Xóa
                                                                </button>
                                                                <button 
                                                                    onClick={() => setDeleteConfirm(null)}
                                                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200"
                                                                >
                                                                    Hủy
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Footer / Pagination Placeholder if needed */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-sm text-gray-500 flex justify-between items-center">
                    <span>Hiển thị {filteredStudents.length} kết quả</span>
                    {/* Add Pagination Here if needed */}
                </div>
            </div>
        </div>
    );
};

export default StudentList;
