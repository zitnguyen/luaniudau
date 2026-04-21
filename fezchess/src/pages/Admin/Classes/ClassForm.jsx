import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Calendar, Clock, BookOpen, DollarSign, Users, Award, FileText, User, Check, Loader2 } from "lucide-react";
import classService from "../../../services/classService";
import teacherService from "../../../services/teacherService";
import studentService from "../../../services/studentService";

const SchedulePicker = ({ value, onChange }) => {
    // Parse existing value "T2/T4 (18:00)" -> days=["T2", "T4"], time="18:00"
    const [selectedDays, setSelectedDays] = useState([]);
    const [time, setTime] = useState("");

    useEffect(() => {
        if (value) {
            // Regex to extract time in parens ()
            const timeMatch = value.match(/\((.*?)\)/);
            if (timeMatch) {
                setTime(timeMatch[1]);
            }
            
            // Extract days part (before the parenthesis)
            const daysPart = value.split('(')[0];
            if (daysPart) {
                const days = daysPart.split('/').map(d => d.trim()).filter(d => d);
                setSelectedDays(days);
            }
        }
    }, [value]);

    const daysOptions = [
        { key: "T2", label: "Thứ 2" },
        { key: "T3", label: "Thứ 3" },
        { key: "T4", label: "Thứ 4" },
        { key: "T5", label: "Thứ 5" },
        { key: "T6", label: "Thứ 6" },
        { key: "T7", label: "Thứ 7" },
        { key: "CN", label: "CN" }
    ];

    const handleDayToggle = (day) => {
        const newDays = selectedDays.includes(day)
            ? selectedDays.filter(d => d !== day)
            : [...selectedDays, day].sort((a, b) => {
                const order = { "T2": 1, "T3": 2, "T4": 3, "T5": 4, "T6": 5, "T7": 6, "CN": 7 };
                return order[a] - order[b];
            });
        
        setSelectedDays(newDays);
        updateParent(newDays, time);
    };

    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setTime(newTime);
        updateParent(selectedDays, newTime);
    };

    const updateParent = (days, t) => {
        if (days.length === 0 && !t) {
            onChange("");
            return;
        }
        const str = `${days.join('/')} (${t})`;
        onChange(str);
    };

    return (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex flex-col gap-4">
                <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Chọn Ngày trong tuần:</div>
                    <div className="flex flex-wrap gap-2">
                        {daysOptions.map(day => (
                            <button
                                key={day.key}
                                type="button"
                                onClick={() => handleDayToggle(day.key)}
                                className={`
                                    px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                                    ${selectedDays.includes(day.key) 
                                        ? 'bg-primary text-white shadow-md shadow-primary/20 ring-2 ring-primary ring-offset-1' 
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }
                                `}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Chọn Giờ bắt đầu:</div>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="time" 
                            value={time}
                            onChange={handleTimeChange}
                            className="block w-40 pl-10 pr-4 py-2 text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary border shadow-sm"
                        />
                    </div>
                </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-500">
                <Check size={14} className="text-green-500" />
                <span>Kết quả: </span>
                <span className="font-medium text-gray-900">{value || '(Chưa chọn)'}</span>
            </div>
        </div>
    );
};

const ClassForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Auxiliary data
  const [teachers, setTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [formData, setFormData] = useState({
    classId: "",
    className: "",
    description: "",
    fee: 1500000,
    level: "Beginner",
    maxStudents: 15,
    totalSessions: 16,
    durationWeeks: 12,
    
    teacherId: "",
    startDate: "",
    schedule: "",
    status: "Pending",
  });

  useEffect(() => {
    fetchAuxData();
    if (isEditMode) {
      fetchClass();
    }
  }, [id]);

  const fetchAuxData = async () => {
    try {
        const [teachersData, studentsData] = await Promise.all([
            teacherService.getAll(),
            studentService.getAll()
        ]);
        setTeachers(Array.isArray(teachersData) ? teachersData : teachersData.users || []);
        setAllStudents(Array.isArray(studentsData) ? studentsData : studentsData || []);
    } catch (err) {
        console.error("Error fetching aux data:", err);
    }
  };

  const fetchClass = async () => {
    try {
      setLoading(true);
      const response = await classService.getById(id);
      setFormData({
        classId: response.classId || "",
        className: response.className || "",
        description: response.description || "",
        fee: response.fee || 1500000,
        level: response.level || "Beginner",
        maxStudents: response.maxStudents || 15,
        totalSessions: response.totalSessions || 16,
        durationWeeks: response.durationWeeks || 12,

        teacherId: response.teacherId?._id || response.teacherId || "",
        startDate: response.startDate ? response.startDate.split("T")[0] : "",
        schedule: response.schedule || "",
        status: response.status || "Pending",
      });
      // Set selected students from response
      if (response.students && Array.isArray(response.students)) {
          setSelectedStudents(response.students.map(s => s._id));
      }
    } catch (err) {
      setError("Lỗi khi tải dữ liệu lớp học");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.classId || !formData.className) {
        setError("Vui lòng điền các trường bắt buộc (ID, Tên lớp)");
        return;
    }

    try {
      setSubmitting(true);
      const payload = { 
          ...formData, 
          classId: Number(formData.classId),
          students: selectedStudents // Send selected student IDs
      };
      let savedId = id;
      if (isEditMode) {
        await classService.update(id, payload);
      } else {
        const created = await classService.create(payload);
        savedId = created?._id;
      }
      navigate("/classes", {
        state: {
          updatedClassId: savedId,
          updatedAt: Date.now(),
        },
      });
    } catch (err) {
      console.error("Error saving class:", err);
      setError(err.response?.data?.message || "Lỗi khi lưu dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/classes")} 
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? "Chỉnh sửa Lớp học" : "Thêm Lớp học mới"}</h1>
            <p className="text-sm text-gray-500 mt-1">Điền đầy đủ thông tin bên dưới để {isEditMode ? "cập nhật" : "tạo"} lớp học</p>
          </div>
        </div>
        <button 
            onClick={handleSubmit} 
            disabled={submitting} 
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium"
        >
          {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span>{submitting ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-2 space-y-6">
            {/* General Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <BookOpen size={20} className="text-primary" />
                    Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mã Lớp (Số) <span className="text-red-500">*</span></label>
                        <input 
                            type="number" 
                            name="classId" 
                            value={formData.classId} 
                            onChange={handleChange} 
                            required 
                            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                            placeholder="Nhập mã lớp..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên Lớp <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            name="className" 
                            value={formData.className} 
                            onChange={handleChange} 
                            required 
                            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                            placeholder="VD: Nhập môn Cờ vua K12"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cấp Độ</label>
                        <div className="relative">
                            <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select 
                                name="level" 
                                value={formData.level} 
                                onChange={handleChange} 
                                className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none appearance-none"
                            >
                                <option value="Beginner">Nhập môn (Beginner)</option>
                                <option value="Basic">Cơ bản (Basic)</option>
                                <option value="Intermediate">Trung cấp (Intermediate)</option>
                                <option value="Advanced">Nâng cao (Advanced)</option>
                                <option value="Master">Master</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng Thái</label>
                        <select 
                            name="status" 
                            value={formData.status} 
                            onChange={handleChange} 
                            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                        >
                            <option value="Pending">Sắp khai giảng</option>
                            <option value="Active">Đang diễn ra</option>
                            <option value="Finished">Đã kết thúc</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô Tả</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                rows={3} 
                                className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none resize-none"
                                placeholder="Mô tả chi tiết về lớp học..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Teaching Details Card */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <Users size={20} className="text-primary" />
                    Chi tiết giảng dạy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Giáo Viên Phụ Trách</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select 
                                name="teacherId" 
                                value={formData.teacherId} 
                                onChange={handleChange} 
                                className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none appearance-none"
                            >
                                <option value="">-- Chọn Giáo Viên --</option>
                                {teachers.map(t => (
                                    <option key={t._id} value={t._id}>{t.username} ({t.email})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày Khai Giảng</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="date" 
                                name="startDate" 
                                value={formData.startDate} 
                                onChange={handleChange} 
                                className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none" 
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Lịch Học Hàng Tuần</label>
                        <SchedulePicker 
                            value={formData.schedule} 
                            onChange={(newSchedule) => setFormData(prev => ({ ...prev, schedule: newSchedule }))} 
                        />
                    </div>
                </div>
            </div>

            {/* Students Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        Danh sách học viên
                    </h3>
                    <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">
                        Đã chọn: {selectedStudents.length} / {allStudents.length}
                    </span>
                </div>
               
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
                        Chọn học viên tham gia lớp này
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {allStudents.map(student => (
                            <label 
                                key={student._id} 
                                className={`
                                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                    ${selectedStudents.includes(student._id) 
                                        ? 'bg-primary/5 border-primary ring-1 ring-primary' 
                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className="relative flex items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedStudents.includes(student._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedStudents([...selectedStudents, student._id]);
                                            } else {
                                                setSelectedStudents(selectedStudents.filter(id => id !== student._id));
                                            }
                                        }}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">{student.fullName}</div>
                                    <div className="text-xs text-gray-500 truncate">ID: {student.studentId}</div>
                                </div>
                            </label>
                        ))}
                        {allStudents.length === 0 && (
                            <div className="col-span-full py-8 text-center text-gray-500 text-sm">
                                Chưa có học viên nào trong hệ thống
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Stats & Settings */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <DollarSign size={20} className="text-primary" />
                    Học phí & Chỉ số
                </h3>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Học Phí (VND)</label>
                        <div className="relative">
                             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₫</div>
                            <input 
                                type="number" 
                                name="fee" 
                                value={formData.fee} 
                                onChange={handleChange} 
                                className="block w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Sĩ Số Tối Đa</label>
                        <input 
                            type="number" 
                            name="maxStudents" 
                            value={formData.maxStudents} 
                            onChange={handleChange} 
                            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tổng Số Buổi</label>
                        <input 
                            type="number" 
                            name="totalSessions" 
                            value={formData.totalSessions} 
                            onChange={handleChange} 
                            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none" 
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Thời Lượng (Tuần)</label>
                        <input 
                            type="number" 
                            name="durationWeeks" 
                            value={formData.durationWeeks} 
                            onChange={handleChange} 
                            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none" 
                        />
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <h4 className="text-blue-800 font-semibold mb-2 text-sm">Lưu ý</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Sinh viên được thêm vào lớp sẽ tự động được ghi danh.</li>
                    <li>Lịch học sẽ được hiển thị trên thời khóa biểu của giáo viên và học viên.</li>
                    <li>Đảm bảo mã lớp là duy nhất.</li>
                </ul>
            </div>
        </div>
      </form>
    </div>
  );
};

export default ClassForm;
