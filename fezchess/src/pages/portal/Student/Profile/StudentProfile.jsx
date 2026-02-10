import React, { useState, useEffect } from 'react';
import { Camera, Calendar, Mail, Phone, MapPin, User, Lock, RotateCcw, Save } from 'lucide-react';
import studentService from '../../../../services/studentService';
import { CURRENT_STUDENT_ID } from '../../../../mockAuth';

const StudentProfile = () => {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                // In a real app, you'd get ID from context/session. 
                // Here we accept CURRENT_STUDENT_ID or fallback to fetching the first student
                let id = CURRENT_STUDENT_ID;
                
                // Fallback if CURRENT_STUDENT_ID is not valid in your DB: fetch first student
                if (!id) {
                     const data = await studentService.getAll();
                     if (data.length > 0) id = data[0]._id;
                }

                if (id) {
                    const data = await studentService.getById(id);
                    setStudent(data);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, []);

    if (loading) return <div className="page-container">Đang tải hồ sơ...</div>;
    if (!student) return <div className="page-container">Không tìm thấy thông tin học viên.</div>;

    return (
        <div className="page-container">
             {/* Breadcrumb style header if needed, or simple title */}
             <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>Trang chủ &gt; <span style={{ color: '#111827', fontWeight: '500' }}>Hồ sơ học viên</span></div>

             {/* Profile Header Card */}
             <div style={{ background: 'white', borderRadius: '16px', padding: '32px', display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '24px', position: 'relative', border: '1px solid #E5E7EB' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                         {/* Placeholder Avatar */}
                         <img src="https://i.pravatar.cc/150?img=12" alt="Student" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <button style={{ position: 'absolute', bottom: '0', right: '0', background: '#2563EB', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
                        <Camera size={16} />
                    </button>
                </div>
                
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{student.fullName}</h1>
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>● {student.status === 'active' ? 'Đang học' : 'Tạm nghỉ'}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F3F4F6', padding: '8px 16px', borderRadius: '8px' }}>
                            <span style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>🏆</span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563' }}>ELO: <span style={{ color: '#111827' }}>{student.elo || 0}</span></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F3F4F6', padding: '8px 16px', borderRadius: '8px' }}>
                            <span style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>🎓</span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563' }}>Level: <span style={{ color: '#111827' }}>{student.skillLevel || 'N/A'}</span></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F3F4F6', padding: '8px 16px', borderRadius: '8px' }}>
                            <Calendar size={16} color="#6B7280" />
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563' }}>Ngày sinh: <span style={{ color: '#111827' }}>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN') : '---'}</span></span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                     <button style={{ border: '1px solid #E5E7EB', background: 'white', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <RotateCcw size={16} />
                        <span>Đổi mật khẩu</span>
                    </button>
                    <button style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2563EB', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <Save size={18} />
                        <span>Lưu thay đổi</span>
                    </button>
                </div>
             </div>

             {/* Forms Section */}
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Personal Info */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                        <div style={{ background: '#DBEAFE', padding: '8px', borderRadius: '8px', color: '#2563EB' }}><User size={20} /></div>
                        <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Thông tin cá nhân</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Họ và tên học viên</label>
                            <input type="text" defaultValue={student.fullName} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#F9FAFB' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Ngày sinh</label>
                                <input type="date" defaultValue={student.dateOfBirth ? student.dateOfBirth.split('T')[0] : ''} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white' }} />
                            </div>
                             <div className="form-group">
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Giới tính</label>
                                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#F9FAFB', appearance: 'none' }} defaultValue={student.gender || 'Nam'}>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Trường học hiện tại</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🎓</span>
                                <input type="text" defaultValue={student.school || ''} placeholder="Nhập tên trường..." style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#F9FAFB' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parent Info */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                        <div style={{ background: '#DBEAFE', padding: '8px', borderRadius: '8px', color: '#2563EB' }}><User size={20} /></div>
                        <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Thông tin phụ huynh</h2>
                    </div>

                     <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Họ tên phụ huynh</label>
                            <input type="text" defaultValue={student.parentId?.fullName || student.parentName || ''} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Số điện thoại</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                    <input type="text" defaultValue={student.parentId?.phone || student.parentPhone || ''} style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#F9FAFB' }} />
                                </div>
                            </div>
                             <div className="form-group">
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email liên hệ</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                    <input type="email" defaultValue={student.parentId?.email || student.email || ''} style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white' }} />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Địa chỉ</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
                                <textarea defaultValue={student.address || ''} style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#F9FAFB', minHeight: '80px', fontFamily: 'inherit' }} />
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             {/* Footer Actions */}
             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
                <button style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#6B7280', fontWeight: '600', cursor: 'pointer' }}>Hủy thay đổi</button>
                <button style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563EB', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Save size={18} />
                    <span>Lưu thông tin</span>
                </button>
             </div>
        </div>
    );
};

export default StudentProfile;
