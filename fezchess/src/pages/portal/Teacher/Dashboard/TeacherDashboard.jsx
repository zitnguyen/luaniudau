import React from 'react';
import { Calendar, Users, FileText, AlertCircle, Clock, CheckCircle, Plus } from 'lucide-react';


const TeacherDashboard = () => {
  const nextClass = {
      name: 'Khai cuộc nâng cao',
      time: '14:00 hôm nay',
      duration: '90 phút'
  };

  const stats = [
      { label: 'Lớp đang dạy', value: '04', sub: '+1 lớp mới tháng này', icon: BookIcon, color: '#e0f2fe', textColor: '#0284c7' },
      { label: 'Tổng học viên', value: '42', sub: '38 đang hoạt động', icon: Users, color: '#f3e8ff', textColor: '#9333ea' },
      { label: 'Lịch tuần này', value: '08', sub: 'Sắp tới: 14:00 hôm nay', icon: Calendar, color: '#ffedd5', textColor: '#ea580c' },
      { label: 'Cần duyệt', value: '03', sub: '! Cần xử lý ngay', icon: AlertCircle, color: '#fee2e2', textColor: '#dc2626', isWarning: true },
  ];

  const schedule = [
      { id: 1, time: 'HÔM NAY, 14:00 - 15:30', name: 'Khai cuộc nâng cao', room: 'Phòng 201 • Online', students: 12, status: 'active' },
      { id: 2, time: 'NGÀY MAI, 09:00 - 10:30', name: 'Cờ vua căn bản - K12', room: 'Phòng 102', students: 15, status: 'upcoming' },
      { id: 3, time: 'THỨ 6, 16:00 - 17:30', name: 'Chiến thuật trung cuộc', room: 'Phòng 205', students: 10, status: 'upcoming' },
  ];

  const todos = [
      { id: 1, title: "Điểm danh lớp 'Khai cuộc' hôm qua", deadline: 'Hết hạn trong 2 giờ', urgency: 'high' },
      { id: 2, title: "Chấm điểm bài tập về nhà K12", deadline: 'Hạn chót: Thứ 6', urgency: 'normal' },
      { id: 3, title: "Gửi báo cáo tháng 10", deadline: 'Hạn chót: Cuối tháng', urgency: 'normal' },
  ];

  return (
    <div className="teacher-dashboard">
        {/* Welcome Section */}
        <div className="welcome-banner">
            <div>
                <h1 className="welcome-title">Xin chào, Thầy Minh! 👋</h1>
                <p className="welcome-sub">
                    <span className="calendar-icon">📅</span> Lớp tiếp theo: <strong>{nextClass.name}</strong> — Bắt đầu lúc {nextClass.time}.
                </p>
            </div>
            <div className="welcome-actions">
                <button className="btn-outline">
                    <Calendar size={16}/> Xem lịch đầy đủ
                </button>
                <button className="btn-primary-light">
                    <CheckCircle size={16}/> Điểm danh nhanh
                </button>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="t-stats-grid">
            {stats.map((stat, index) => (
                <div className="t-stat-card" key={index}>
                    <div className="t-stat-top">
                        <div className="t-stat-label">{stat.label}</div>
                        <div className="t-stat-icon" style={{background: stat.color, color: stat.textColor}}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                    <div className="t-stat-value">{stat.value}</div>
                    <div className={`t-stat-sub ${stat.isWarning ? 'warning-text' : ''}`}>
                        {stat.sub}
                    </div>
                </div>
            ))}
        </div>

        <div className="dashboard-columns">
             {/* Left Column: Schedule */}
            <div className="column-main">
                <div className="section-header">
                    <h3><Clock size={20} className="section-icon-blue"/> Lịch dạy sắp tới</h3>
                    <a href="#" className="link-action">Xem tất cả</a>
                </div>
                <div className="schedule-list">
                    {schedule.map((item, index) => (
                        <div className="schedule-item" key={item.id}>
                            <div className="timeline-dot"></div>
                            {index !== schedule.length - 1 && <div className="timeline-line"></div>}
                            
                            <div className="schedule-content">
                                <div className="schedule-time">{item.time}</div>
                                <div className="schedule-card">
                                    <div className="schedule-info">
                                        <h4>{item.name}</h4>
                                        <div className="schedule-room">🏢 {item.room}</div>
                                    </div>
                                    <div className="schedule-actions">
                                        <div className="avatar-group">
                                            <img src="https://i.pravatar.cc/150?img=1" alt="" />
                                            <img src="https://i.pravatar.cc/150?img=2" alt="" />
                                            <span className="avatar-more">+{item.students}</span>
                                        </div>
                                        {item.status === 'active' && (
                                            <button className="btn-primary-sm">Vào lớp</button>
                                        )}
                                        <button className="btn-icon-sm">⋮</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Todo & Notifs */}
            <div className="column-side">
                <div className="side-card">
                     <div className="section-header">
                        <h3><CheckCircle size={20} className="section-icon-orange"/> Việc cần làm</h3>
                     </div>
                     <div className="todo-list">
                         {todos.map(todo => (
                             <div className="todo-item" key={todo.id}>
                                 <input type="checkbox" className="todo-check" />
                                 <div className="todo-info">
                                     <div className="todo-title">{todo.title}</div>
                                     <div className={`todo-deadline ${todo.urgency === 'high' ? 'deadline-high' : ''}`}>
                                         {todo.deadline}
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                     <button className="add-task-btn">
                         <Plus size={16}/> Thêm công việc
                     </button>
                </div>

                <div className="side-card">
                    <div className="section-header">
                        <h3>📢 Thông báo</h3>
                         <span className="badge-new">Mới</span>
                     </div>
                     <div className="notif-box">
                         <div className="notif-icon-box">ℹ️</div>
                         <div className="notif-content-box">
                             <div className="notif-box-title">Bảo trì hệ thống</div>
                             <div className="notif-box-desc">Hệ thống sẽ bảo trì vào 22:00 tối nay để nâng cấp tính năng mới.</div>
                             <div className="notif-box-time">1 giờ trước</div>
                         </div>
                     </div>
                      <div className="notif-box">
                         <div className="notif-icon-box success">🏆</div>
                         <div className="notif-content-box">
                             <div className="notif-box-title">Giải đấu Mùa Đông</div>
                             <div className="notif-box-desc">Đã mở đăng ký cho giải đấu Cờ vua Mùa Đông.</div>
                         </div>
                     </div>
                </div>
            </div>
        </div>
        
        {/* Classes Footer Section */}
        <div className="classes-footer-section">
             <h3>🎓 Lớp đang dạy</h3>
             <div className="class-cards-row">
                 <div className="class-mini-card">
                     <div className="class-icon-wrapper-blue">🎮</div>
                     <div className="class-mini-info">
                         <div className="class-mini-status success">Đang diễn ra</div>
                     </div>
                 </div>
                  <div className="class-mini-card">
                     <div className="class-icon-wrapper-purple">⚙️</div>
                     <div className="class-mini-info">
                         <div className="class-mini-status warning">Sắp kết thúc</div>
                     </div>
                 </div>
             </div>
        </div>
    </div>
  );
};

// Simple Icon component wrapper if needed
const BookIcon = ({size}) => <span>📖</span>;

export default TeacherDashboard;
