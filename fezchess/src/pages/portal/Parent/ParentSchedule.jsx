import React, { useState, useEffect } from 'react';
import studentService from '../../../services/studentService';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ParentSchedule = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weekOffset, setWeekOffset] = useState(0);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user || user.role !== 'Parent') {
             // Basic protection, though strict routing checks are better
             return;
        }
        fetchMyChildren();
    }, []);

    const fetchMyChildren = async () => {
        try {
            setLoading(true);
            const res = await studentService.getByParentId(user._id || user.id);
            setStudents(res);
        } catch (error) {
            console.error("Failed to fetch children", error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInView = () => {
        const today = new Date();
        today.setDate(today.getDate() + (weekOffset * 7));
        const monday = new Date(today);
        const day = monday.getDay(); // 0=Sun
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        monday.setDate(diff);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const daysInView = getDaysInView();
    const daysHeader = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

    const getEventsForCell = (day, hour) => {
        const currentDayVal = day.getDay();
        
        return students.filter(student => {
            if (!student.schedule) return false;
            
            // New Format: Slots
            if (student.schedule.slots && student.schedule.slots.length > 0) {
                return student.schedule.slots.some(slot => {
                    if (slot.day !== currentDayVal) return false;
                    const [h] = slot.time.split(':').map(Number);
                    return h === hour;
                });
            }
            // Legacy Format
            const days = student.schedule.days || [];
            if (!days.includes(currentDayVal)) return false;
            const time = student.schedule.time;
            if (!time) return false;
            const [h] = time.split(':').map(Number);
            return h === hour;
        });
    };

    // Calculate Active Hours
    const activeHoursSet = new Set();
    students.forEach(s => {
        if (s.schedule) {
            if (s.schedule.slots && s.schedule.slots.length > 0) {
                s.schedule.slots.forEach(slot => {
                    if (slot.time) {
                        const [h] = slot.time.split(':').map(Number);
                        if (!isNaN(h)) activeHoursSet.add(h);
                    }
                });
            } else if (s.schedule.time) {
                const [h] = s.schedule.time.split(':').map(Number);
                if (!isNaN(h)) activeHoursSet.add(h);
            }
        }
    });
    
    // Default hours if empty, to show structure
    if (activeHoursSet.size === 0) {
        [9, 10, 14, 15, 16, 17, 18, 19].forEach(h => activeHoursSet.add(h));
    }

    let activeHours = Array.from(activeHoursSet).sort((a, b) => a - b);

    if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Đang tải lịch học...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Lịch học con tôi</h1>
                    <p style={{ color: '#6B7280' }}>
                        Phụ huynh: <strong>{user?.fullName}</strong>
                    </p>
                </div>
                {/* Could add week navigation here later */}
            </div>

            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #000000' }}>
                 {/* Header */}
                 <div style={{ display: 'flex', background: '#F3F4F6', borderBottom: '1px solid #000000' }}>
                    <div style={{ width: '80px', padding: '12px', borderRight: '1px solid #000000' }}></div>
                    {daysInView.map((d, index) => (
                        <div key={index} style={{ 
                            flex: 1, 
                            padding: '12px', 
                            textAlign: 'center', 
                            borderRight: index < 6 ? '1px solid #000000' : 'none',
                            fontWeight: '600',
                            color: d.toDateString() === new Date().toDateString() ? '#2563EB' : '#111827'
                        }}>
                            <div>{daysHeader[index]}</div>
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>{d.getDate()}/{d.getMonth() + 1}</div>
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div>
                     {activeHours.map((hour) => (
                        <div key={hour} style={{ display: 'flex', minHeight: '100px', borderBottom: '1px solid #000000' }}>
                            {/* Time */}
                            <div style={{ 
                                width: '80px', 
                                borderRight: '1px solid #000000', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', background: '#F9FAFB'
                            }}>
                                {hour.toString().padStart(2,'0')}:00
                            </div>

                            {/* Cells */}
                            {daysInView.map((day, index) => {
                                const events = getEventsForCell(day, hour);
                                return (
                                    <div key={index} style={{ 
                                        flex: 1, 
                                        borderRight: index < 6 ? '1px solid #000000' : 'none',
                                        padding: '8px',
                                        background: events.length > 0 ? '#F0FDF4' : 'white'
                                    }}>
                                        {events.map(student => (
                                            <div key={student._id || student.id} style={{
                                                background: 'white', border: '1px solid #000000', borderRadius: '4px',
                                                padding: '8px', boxShadow: '2px 2px 0px #000000', marginBottom: '8px'
                                            }}>
                                                <div style={{ fontWeight: 'bold', color: '#166534' }}>{student.fullName}</div>
                                                <div style={{ fontSize: '12px', color: '#4B5563' }}>{student.skillLevel}</div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                     ))}
                </div>
            </div>
        </div>
    );
};

export default ParentSchedule;
