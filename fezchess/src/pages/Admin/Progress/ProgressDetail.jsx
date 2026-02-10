import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import { Save, ArrowLeft, Download, Plus, Trash2 } from 'lucide-react';

const ProgressDetail = () => {
  const { studentId, classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [sessions, setSessions] = useState([]);
  const [teacherFeedback, setTeacherFeedback] = useState({ strengths: '', weaknesses: '', improvementPlan: '' });
  const [studentInfo, setStudentInfo] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    fetchData();
  }, [studentId, classId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Get Student & Class Info (can assume from Progress or separate APIs, let's try to get specific progress)
      // We don't have a specific "get progress by student/class" API yet, usually we might need to search it.
      // But typically we should just try to create one or get one.
      
      // Let's implement a "Find or Create" logic on frontend or assumes backend handles it.
      // For now, let's try to fetch progress first. Since we didn't make a GET endpoint for detail, we might need one.
      // Wait, I only made the export endpoint.
      // I need a GET endpoint to load this data!
      // I'll assume I can add it to the backend quickly or reusing existing if any (none exist).
      // I will add a GET endpoint to progressRoutes later. For now let's scaffold the frontend to call it.
      
      
      const [progressData, attendanceData] = await Promise.all([
          axiosClient.get(`/progress/${studentId}/${classId}`).catch(err => null), 
          axiosClient.get(`/attendance?studentId=${studentId}&classId=${classId}`) 
      ]);

      if (progressData) {
          setSessions(progressData.sessions || []);
          setTeacherFeedback(progressData.teacherFeedback || { strengths: '', weaknesses: '', improvementPlan: '' });
      }
      
      if (attendanceData) {
          // Merge attendance dates into sessions or prepare them for selection
          // Actually, we want to auto-populate sessions based on attendance
           setAttendanceRecords(attendanceData);
           
           if (!progressData || !progressData.sessions || progressData.sessions.length === 0) {
               // Initialize sessions from attendance
               const initSessions = attendanceData.map(att => ({
                   attendanceId: att._id,
                   date: att.date,
                   content: '',
                   assessment: ''
               }));
               setSessions(initSessions);
           }
      }
      
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
      try {
          setSaving(true);
          const payload = {
              studentId,
              classId,
              sessions: sessions.map(s => ({
                  attendanceId: s.attendanceId,
                  content: s.content,
                  assessment: s.assessment
              })),
              teacherFeedback
          };
          
          // Upsert logic
          await axiosClient.post('/progress', payload);
          alert("Lưu thành công!");
      } catch (error) {
          console.error("Error saving:", error);
          alert("Lỗi khi lưu dữ liệu");
      } finally {
          setSaving(false);
      }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phiếu học tập này không? Hành động này không thể hoàn tác.")) {
        try {
            await axiosClient.delete(`/progress/${studentId}/${classId}`);
            alert("Đã xóa phiếu học tập thành công!");
            navigate('/progress');
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Lỗi khi xóa phiếu học tập");
        }
    }
  };

  const handleExport = () => {
      window.open(`${import.meta.env.VITE_API_URL}/progress/${studentId}/${classId}/export`, '_blank');
  };

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate('/progress')} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Quay lại danh sách
      </button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Chi Tiết Phiếu Học Tập</h1>
        <div className="flex gap-3">
             <button 
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                title="Xóa phiếu học tập"
            >
                <Trash2 className="w-4 h-4" />
                Xóa Phiếu
            </button>
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
                <Download className="w-4 h-4" />
                Xuất File Word
            </button>
            <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
                <Save className="w-4 h-4" />
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
        </div>
      </div>

      <div className="space-y-6">
          {/* Sessions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Nội Dung Chi Tiết</h2>
              {sessions.length === 0 ? (
                  <p className="text-gray-500 italic">Chưa có dữ liệu điểm danh để tạo buổi học.</p>
              ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Buổi / Ngày</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-1/2">Nội Dung Học</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Đánh Giá</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sessions.map((session, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        Buổi {index + 1} <br/>
                                        <span className="text-gray-500 font-normal">
                                            {session.date ? new Date(session.date).toLocaleDateString('vi-VN') : 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <textarea 
                                            className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-primary text-sm min-h-[80px]"
                                            placeholder="Nhập nội dung bài học..."
                                            value={session.content}
                                            onChange={(e) => {
                                                const newSessions = [...sessions];
                                                newSessions[index].content = e.target.value;
                                                setSessions(newSessions);
                                            }}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input 
                                            type="text"
                                            className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-primary text-sm"
                                            placeholder="Tốt / Khá..."
                                            value={session.assessment}
                                            onChange={(e) => {
                                                const newSessions = [...sessions];
                                                newSessions[index].assessment = e.target.value;
                                                setSessions(newSessions);
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              )}
          </div>

          {/* Teacher Feedback */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Đánh Giá Của Giáo Viên</h2>
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ưu điểm</label>
                      <textarea 
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary min-h-[100px]"
                          value={teacherFeedback.strengths}
                          onChange={(e) => setTeacherFeedback({...teacherFeedback, strengths: e.target.value})}
                      />
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nhược điểm</label>
                      <textarea 
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary min-h-[100px]"
                          value={teacherFeedback.weaknesses}
                          onChange={(e) => setTeacherFeedback({...teacherFeedback, weaknesses: e.target.value})}
                      />
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hướng khắc phục</label>
                      <textarea 
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary min-h-[100px]"
                          value={teacherFeedback.improvementPlan}
                          onChange={(e) => setTeacherFeedback({...teacherFeedback, improvementPlan: e.target.value})}
                      />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ProgressDetail;
