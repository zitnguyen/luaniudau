import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Trash2, Download } from 'lucide-react';
import enrollmentService from '../../../services/enrollmentService';
import progressService from '../../../services/progressService';
import authService from '../../../services/authService';

const ProgressList = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'Admin';
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const resolveEntityId = (entity) => {
    if (!entity) return null;
    if (typeof entity === 'string') return entity;
    return entity._id || entity.id || null;
  };
  const getStudentDisplayName = (student) => {
    if (!student) return "Deleted Student";
    if (student.isDeleted) return "Deleted Student";
    return student.fullName || "Deleted Student";
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {

      const data = await enrollmentService.getAll();
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => 
    getStudentDisplayName(enrollment.studentId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (enrollment.classId?.className || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (studentId, classId) => {
      if (!studentId || !classId) {
          alert("Thiếu thông tin học viên hoặc lớp học. Không thể xóa phiếu.");
          return;
      }
      if (window.confirm("Bạn có chắc chắn muốn xóa phiếu học tập của học viên này không?")) {
          try {

              await progressService.remove(studentId, classId);
              alert("Đã xóa phiếu học tập thành công!");
              // Refresh or just let them know (Progress deleted, but Enrollment remains)
          } catch (error) {
              console.error("Error deleting:", error);
              alert("Lỗi khi xóa (hoặc phiếu chưa tồn tại)");
          }
      }
  };

  const handleExport = async (studentId, classId, studentName) => {
    if (!studentId || !classId) return;
    try {
      await progressService.exportWord(studentId, classId, studentName || 'HocVien');
    } catch (error) {
      alert(error?.response?.data?.message || 'Xuất file Word thất bại');
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
                  (() => {
                    const studentId = resolveEntityId(item.studentId);
                    const classId = resolveEntityId(item.classId);
                    const hasValidIds = Boolean(studentId && classId);
                    return (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {getStudentDisplayName(item.studentId)}
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
                        onClick={() => {
                          if (!hasValidIds) {
                            alert("Không tìm thấy ID học viên/lớp học hợp lệ cho dòng này.");
                            return;
                          }
                          navigate(`/progress/${studentId}/${classId}`);
                        }}
                        disabled={!hasValidIds}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                          hasValidIds
                            ? 'bg-primary/10 text-primary hover:bg-primary/20'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        Chi tiết
                      </button>
                      <button
                        onClick={() =>
                          handleExport(
                            studentId,
                            classId,
                            getStudentDisplayName(item.studentId) || "HocVien",
                          )
                        }
                        disabled={!hasValidIds}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ml-2 ${
                          hasValidIds
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title="Xuất file Word"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(studentId, classId)}
                        disabled={!hasValidIds || !isAdmin}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ml-2 ${
                          hasValidIds && isAdmin
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title="Xóa phiếu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                    );
                  })()
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
