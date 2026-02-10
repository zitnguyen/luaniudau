import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import { Search, Filter, FileText, Trash2 } from 'lucide-react';

const ProgressList = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {

      const data = await axiosClient.get('/enrollments');
      setEnrollments(data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => 
    enrollment.studentId?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.classId?.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (studentId, classId) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa phiếu học tập của học viên này không?")) {
          try {

              await axiosClient.delete(`/progress/${studentId}/${classId}`);
              alert("Đã xóa phiếu học tập thành công!");
              // Refresh or just let them know (Progress deleted, but Enrollment remains)
          } catch (error) {
              console.error("Error deleting:", error);
              alert("Lỗi khi xóa (hoặc phiếu chưa tồn tại)");
          }
      }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Phiếu Học Tập</h1>
           <p className="text-gray-500">Quản lý và theo dõi quá trình học tập của học viên</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm học viên hoặc lớp học..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Học Viên</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lớp Học</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : filteredEnrollments.length > 0 ? (
                filteredEnrollments.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.studentId?.fullName || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.classId?.className || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status === 'Active' ? 'Đang học' : item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/progress/${item.studentId?._id}/${item.classId?._id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-medium text-sm transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Chi tiết
                      </button>
                      <button 
                        onClick={() => handleDelete(item.studentId?._id, item.classId?._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors ml-2"
                        title="Xóa phiếu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <span>Chưa có học viên nào trong danh sách.</span>
                      <span className="text-sm">Vui lòng vào menu <strong>Ghi danh</strong> để thêm học viên vào lớp học trước.</span>
                    </div>
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

export default ProgressList;
