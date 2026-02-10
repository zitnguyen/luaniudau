import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, CheckCircle, Wallet, Calendar, ChevronRight, MoreHorizontal, Bell, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import studentService from '../../../../services/studentService';
import enrollmentService from '../../../../services/enrollmentService';
import authService from '../../../../services/authService';
import { CURRENT_STUDENT_ID } from '../../../../mockAuth';

const StudentDashboard = () => {
    const user = authService.getCurrentUser();
    const [student, setStudent] = useState(null);
    const [stats, setStats] = useState({
        attended: 24, // Mock for now, requires attendance counting
        elo: 1200,
        assignments: 85,
        tuitionDue: '20/11'
    });
    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock Data for specific mock charts
    const eloData = [
        { month: 'T1', elo: 1000 },
        { month: 'T2', elo: 1150 },
        { month: 'T3', elo: 1120 },
        { month: 'T4', elo: 1250 },
        { month: 'T5', elo: 1180 },
        { month: 'T6', elo: 1350 }, 
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                let id = CURRENT_STUDENT_ID;
                if (!id) {
                     // Try to find student by logged in user's full name
                     // This is a workaround because User and Student are not explicitly linked in the backend
                     if (user && user.fullName) {
                         // We use getAll with keyword search
                         const students = await studentService.getAll({ keyword: user.fullName });
                         // If we find an exact match or close match
                         const found = students.find(s => s.fullName === user.fullName) || students[0];
                         if (found) id = found._id;
                     }
                     // Fallback if still no ID, just grab the first one for demo purposes if desired, 
                     // or stay null to show empty state.
                     if (!id) {
                         const allStudents = await studentService.getAll();
                         if (allStudents.length > 0) id = allStudents[0]._id;
                     }
                }

                if (id) {
                    // 1. Fetch Student Info (Elo)
                    const studentData = await studentService.getById(id);
                    setStudent(studentData);
                    setStats(prev => ({ ...prev, elo: studentData.elo || 1200 }));

                    // 2. Fetch Enrollments -> Upcoming Classes
                    const enrollments = await enrollmentService.getAll({ studentId: id });
                    
                    // Transform to upcoming classes (Simplified logic: just list enrolled classes)
                    const classes = enrollments.map((enr, index) => ({
                        id: enr.classId._id,
                        title: enr.classId.className,
                        teacher: 'Giáo viên', // Populate if available
                        platform: 'Phòng học 1',
                        time: enr.classId.schedule || '18:00',
                        date: 'HÀNG TUẦN',
                        status: 'offline',
                        isHighlight: index === 0
                    }));
                    setUpcomingClasses(classes.slice(0, 5));
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="page-container">Đang tải bảng điều khiển...</div>;

    return (
        <div className="page-container">
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Xin chào, {user?.fullName || student?.fullName || 'Học viên'} 👋</h1>
                <p style={{ color: '#6B7280' }}>Cùng xem lại tiến độ học tập và các hoạt động tuần này.</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {/* Card 1 */}
                <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ width: '40px', height: '40px', background: '#E0F2FE', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7' }}>
                            <BookOpen size={24} />
                         </div>
                         <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#059669', background: '#ECFDF5', padding: '4px 8px', borderRadius: '12px' }}>+2 tuần này</span>
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px' }}>Số buổi đã học</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.attended} buổi</div>
                </div>

                 {/* Card 2 */}
                 <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ width: '40px', height: '40px', background: '#F3E8FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333EA' }}>
                            <Trophy size={24} />
                         </div>
                         <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#059669', background: '#ECFDF5', padding: '4px 8px', borderRadius: '12px' }}>Current</span>
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px' }}>Elo Rating</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.elo}</div>
                </div>

                {/* Card 3 */}
                <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ width: '40px', height: '40px', background: '#FFEDD5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                            <CheckCircle size={24} />
                         </div>
                         <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#059669', background: '#ECFDF5', padding: '4px 8px', borderRadius: '12px' }}>+5%</span>
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px' }}>Bài tập hoàn thành</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.assignments}%</div>
                </div>

                 {/* Card 4 */}
                 <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ width: '40px', height: '40px', background: '#FCE7F3', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DB2777' }}>
                            <Wallet size={24} />
                         </div>
                         <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', background: '#F3F4F6', padding: '4px 8px', borderRadius: '12px' }}>Đến hạn: {stats.tuitionDue}</span>
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px' }}>Học phí sắp tới</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>2.000.000đ</div>
                </div>
            </div>

            {/* Main Content Split */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Chart Section */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Biểu đồ phát triển Elo</h3>
                                <p style={{ fontSize: '14px', color: '#6B7280' }}>Theo dõi sự tiến bộ trong 6 tháng qua</p>
                            </div>
                            <div style={{ background: '#F3F4F6', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                6 tháng qua <ChevronDown size={14} />
                            </div>
                        </div>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={eloData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} hide={true} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="elo" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: 'white', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Homework Section */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Bài tập về nhà</h3>
                            <button style={{ color: '#2563EB', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}>Xem tất cả</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
                             <div style={{ width: '48px', height: '48px', background: '#FEF3C7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                                <BookOpen size={24} />
                             </div>
                             <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', color: '#111827' }}>Chiếu hết trong 2 nước</div>
                                <div style={{ fontSize: '14px', color: '#6B7280' }}>Đã làm 8/10 câu</div>
                             </div>
                             <div style={{ width: '150px' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '12px', fontWeight: '600', color: '#2563EB', marginBottom: '4px' }}>80%</div>
                                <div style={{ width: '100%', height: '6px', background: '#F3F4F6', borderRadius: '4px' }}>
                                    <div style={{ width: '80%', height: '100%', background: '#2563EB', borderRadius: '4px' }}></div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Schedule) */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', height: 'fit-content' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Lớp học của bạn</h3>
                        <MoreHorizontal size={20} color="#9CA3AF" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {upcomingClasses.length === 0 ? (
                            <div style={{color: '#6B7280'}}>Chưa đăng ký lớp nào.</div>
                        ) : upcomingClasses.map((cls, index) => (
                            <div key={cls.id + index} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                                {index !== upcomingClasses.length - 1 && (
                                    <div style={{ position: 'absolute', left: '20px', top: '40px', bottom: '-24px', width: '2px', background: '#F3F4F6' }}></div>
                                )}
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: cls.isHighlight ? '#2563EB' : 'white', border: cls.isHighlight ? 'none' : '2px solid #E5E7EB', color: cls.isHighlight ? 'white' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', flexShrink: 0, zIndex: 1 }}>
                                    {index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: cls.isHighlight ? '#2563EB' : '#6B7280', textTransform: 'uppercase' }}>{cls.date}, {cls.time}</span>
                                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: cls.status === 'online' ? '#DCFCE7' : '#F3F4F6', color: cls.status === 'online' ? '#166534' : '#374151', fontWeight: '600' }}>
                                            {cls.status === 'online' ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                    <div style={{ fontWeight: '600', color: '#111827', marginBottom: '2px' }}>{cls.title}</div>
                                    <div style={{ fontSize: '13px', color: '#6B7280' }}>{cls.teacher} • {cls.platform}</div>
                                    
                                    {cls.isHighlight && (
                                        <button style={{ marginTop: '12px', width: '100%', background: '#2563EB', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
                                            Vào lớp học
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};



export default StudentDashboard;
