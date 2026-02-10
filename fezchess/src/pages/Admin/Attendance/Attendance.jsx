import React, { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle, XCircle, Search, AlertCircle, Loader2 } from 'lucide-react';
import studentService from '../../../services/studentService';
import attendanceService from '../../../services/attendanceService';

const Attendance = () => {

    // State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null); // Success/Error message

    // Load Students & Attendance when Date changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get All Students
                const studentsData = await studentService.getAll();
                const allStudents = Array.isArray(studentsData) ? studentsData : (studentsData.students || []);
                
                // 2. Filter Students Scheduled for this Day
                const dayOfWeek = new Date(selectedDate).getDay(); // 0=Sun, 1=Mon...
                const scheduledStudents = allStudents.filter(s => {
                    if (!s.schedule) return false;
                    // Check slots first (new format)
                    if (s.schedule.slots && s.schedule.slots.length > 0) {
                        return s.schedule.slots.some(slot => slot.day === dayOfWeek);
                    }
                    // Fallback to legacy
                    return s.schedule.days && s.schedule.days.includes(dayOfWeek);
                });

                // 3. Get Existing Attendance for this Date
                const attendanceData = await attendanceService.getAll({ 
                    date: selectedDate 
                });
                const attendanceRecords = Array.isArray(attendanceData) ? attendanceData : (attendanceData.attendance || []);

                // 4. Merge Data
                const mergedData = scheduledStudents.map(student => {
                    const existingRecord = attendanceRecords.find(r => 
                        (r.studentId?._id || r.studentId) === student._id
                    );

                    return {
                        id: student._id,
                        name: student.fullName,
                        studentId: student.studentId, // ID code like HS001
                        status: existingRecord ? existingRecord.status : 'present',
                        note: existingRecord ? existingRecord.note : '',
                        recordId: existingRecord ? existingRecord._id : null,
                        sessionsTotal: student.sessions?.total || 16,
                        sessionsUsed: student.sessions?.used || 0
                    };
                });
                
                setStudents(mergedData);
            } catch (err) {
                console.error("Failed to fetch attendance data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedDate]);

    const handleStatusChange = (studentId, newStatus) => {
        setStudents(students.map(s => 
            s.id === studentId ? { ...s, status: newStatus } : s
        ));
    };

    const handleNoteChange = (studentId, note) => {
        setStudents(students.map(s => 
            s.id === studentId ? { ...s, note } : s
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            // Save each student's attendance
            const promises = students.map(student => {
                const payload = {
                    studentId: student.id,
                    date: selectedDate,
                };

                if (student.status === 'present') {
                    return attendanceService.markPresent(payload);
                } else {
                    return attendanceService.markAbsent({
                        ...payload,
                        reason: student.note
                    });
                }
            });

            await Promise.all(promises);
            setMessage({ type: 'success', text: 'Đã lưu điểm danh thành công!' });
            setTimeout(() => setMessage(null), 3000);

        } catch (err) {
            console.error("Failed to save attendance", err);
            setMessage({ type: 'error', text: 'Lỗi khi lưu điểm danh.' });
        } finally {
            setSaving(false);
        }
    };

    const stats = {
        present: students.filter(s => s.status === 'present').length,
        absent: students.filter(s => s.status === 'absent').length,
        total: students.length
    };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Điểm Danh Hôm Nay</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý điểm danh học viên theo ngày</p>
        </div>
        <div className="flex gap-3">
             <div className="relative">
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none shadow-sm" 
                />
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
             </div>
            <button 
                onClick={handleSave} 
                disabled={saving || students.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium"
            >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                <span>{saving ? 'Đang lưu...' : 'Lưu Điểm Danh'}</span>
            </button>
        </div>
      </div>

      {message && (
          <div className={`
            flex items-center gap-3 p-4 rounded-xl border
            ${message.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-100' 
                : 'bg-red-50 text-red-700 border-red-100'
            }
          `}>
              {message.type === 'success' ? <CheckCircle size={20} className="text-green-500" /> : <AlertCircle size={20} className="text-red-500" />}
              <span className="font-medium">{message.text}</span>
          </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                 <div className="text-sm font-medium text-gray-500">Tổng học viên</div>
                 <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
                 <div className="text-xs text-gray-400 mt-1">Dự kiến hôm nay</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Search size={20} />
            </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                 <div className="text-sm font-medium text-gray-500">Có mặt</div>
                 <div className="text-2xl font-bold text-green-600 mt-1">{stats.present}</div>
                 <div className="text-xs text-green-600/80 mt-1">{stats.total > 0 ? Math.round((stats.present/stats.total)*100) : 0}% tỷ lệ chuyên cần</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <CheckCircle size={20} />
            </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                 <div className="text-sm font-medium text-gray-500">Vắng mặt</div>
                 <div className="text-2xl font-bold text-red-600 mt-1">{stats.absent}</div>
                 <div className="text-xs text-red-600/80 mt-1">Cần theo dõi</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <XCircle size={20} />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
             <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Loader2 className="animate-spin mb-3 text-primary" size={32} />
                <span>Đang tải danh sách học viên...</span>
            </div>
        ) : students.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-50/50">
                <Calendar size={48} className="text-gray-300 mb-4" />
                <span className="font-medium text-gray-600">Không có lịch học nào vào ngày này</span>
                <span className="text-sm mt-1">Vui lòng chọn ngày khác để xem danh sách</span>
            </div>
        ) : (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="w-16 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">STT</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Học sinh</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ghi chú / Lý do</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-500">
                                #{index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div className="font-semibold text-gray-900">{student.name}</div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                        <span>ID: {student.studentId || 'N/A'}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className={`${(student.sessionsTotal - student.sessionsUsed) <= 2 ? 'text-red-500 font-bold' : 'text-green-600 font-medium'}`}>
                                            Tiến độ: {student.sessionsUsed}/{student.sessionsTotal}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-center">
                                    <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                                        <button 
                                            onClick={() => handleStatusChange(student.id, 'present')}
                                            className={`
                                                px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2
                                                ${student.status === 'present' 
                                                    ? 'bg-white text-green-600 shadow-sm ring-1 ring-black/5' 
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }
                                            `}
                                        >
                                            <CheckCircle size={16} className={student.status === 'present' ? 'fill-green-100' : ''} />
                                            Có mặt
                                        </button>
                                        <button 
                                            onClick={() => handleStatusChange(student.id, 'absent')}
                                            className={`
                                                px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2
                                                ${student.status === 'absent' 
                                                    ? 'bg-white text-red-600 shadow-sm ring-1 ring-black/5' 
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }
                                            `}
                                        >
                                            <XCircle size={16} className={student.status === 'absent' ? 'fill-red-100' : ''} />
                                            Vắng
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <input 
                                    type="text" 
                                    placeholder={student.status === 'absent' ? "Nhập lý do vắng..." : "Ghi chú thêm..."}
                                    value={student.note}
                                    onChange={(e) => handleNoteChange(student.id, e.target.value)}
                                    className={`
                                        w-full px-4 py-2 rounded-lg border text-sm outline-none transition-all
                                        ${student.status === 'absent' && !student.note 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/30' 
                                            : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50 focus:bg-white'
                                        }
                                    `}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
