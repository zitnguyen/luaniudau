import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Search, ChevronDown, MapPin } from 'lucide-react';
import scheduleService from '../../../../services/scheduleService';

const StudentSchedule = () => {
    const days = [
        { name: 'T2', date: '16' },
        { name: 'T3', date: '17', isToday: true }, // Mocking T3 as today
        { name: 'T4', date: '18' },
        { name: 'T5', date: '19' },
        { name: 'T6', date: '20' },
        { name: 'T7', date: '21' },
        { name: 'CN', date: '22' },
    ];

    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
    ];

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const schedules = await scheduleService.getAll();
                const newEvents = [];
                schedules.forEach((item) => {
                    const slots = Array.isArray(item.scheduleSlots) ? item.scheduleSlots : [];
                    slots.forEach((slot, index) => {
                        const startTime = slot?.time || '00:00';
                        const [startHour, startMin] = startTime.split(':').map(Number);
                        const offsetHours = startHour - 8;
                        const offsetSlots = offsetHours + ((startMin || 0) / 60);
                        const durationHours = Math.max(1, Number(slot?.duration || 90) / 60);
                        const endHour = Math.floor(startHour + durationHours);
                        newEvents.push({
                            id: `${item.classId}-${slot.day}-${index}`,
                            title: item.className,
                            time: `${startTime} - ${String(endHour).padStart(2, '0')}:${String(startMin || 0).padStart(2, '0')}`,
                            dayIndex: slot.day === 0 ? 6 : slot.day - 1,
                            startSlotIndex: offsetSlots,
                            duration: durationHours,
                            type: 'class'
                        });
                    });
                });
                setEvents(newEvents);
            } catch (err) {
                console.error("Failed to fetch schedule", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1>Lịch Học</h1>
                    <p className="page-subtitle">Theo dõi thời khóa biểu tuần này (16/10 - 22/10)</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} />
                    <span>Đăng ký lớp mới</span>
                </button>
            </div>

            {/* Controls */}
            <div className="control-bar" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', fontWeight: '600' }}>Tuần</button>
                    <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#6B7280' }}>Tháng</button>
                </div>
                
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
                     <span style={{ fontSize: '14px', color: '#6B7280' }}>Lọc theo:</span>
                     <div className="dropdown" style={{ minWidth: '140px', background: '#F3F4F6', border: 'none' }}>
                        <span>Tất cả các lớp</span>
                        <ChevronDown size={16} />
                     </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                {/* Header Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ padding: '16px', borderRight: '1px solid #E5E7EB' }}></div>
                    {days.map((day, index) => (
                        <div key={index} style={{ padding: '16px', textAlign: 'center', borderRight: index !== 6 ? '1px dashed #E5E7EB' : 'none', background: day.isToday ? '#EFF6FF' : 'transparent' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: day.isToday ? '#2563EB' : '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>{day.name}</div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: day.isToday ? '#2563EB' : '#111827' }}>
                                {day.isToday ? <span style={{ background: '#2563EB', color: 'white', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{day.date}</span> : day.date}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid Content */}
                <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                    {/* Time Column */}
                    <div>
                        {timeSlots.map((time, index) => (
                            <div key={index} style={{ height: '100px', borderBottom: '1px dashed #E5E7EB', borderRight: '1px solid #E5E7EB', padding: '8px', fontSize: '12px', color: '#6B7280', fontWeight: '500', textAlign: 'center' }}>
                                {time}
                            </div>
                        ))}
                    </div>

                    {/* Day Columns BG */}
                    {days.map((day, index) => (
                        <div key={index} style={{ borderRight: index !== 6 ? '1px dashed #E5E7EB' : 'none', position: 'relative' }}>
                            {timeSlots.map((_, tIndex) => (
                                <div key={tIndex} style={{ height: '100px', borderBottom: '1px dashed #E5E7EB' }}></div>
                            ))}
                            
                            {/* Current Time Line Mockup (Only for today) */}
                            {day.isToday && (
                                <div style={{ position: 'absolute', top: '250px', left: '-60px', right: 0, height: '2px', background: '#EF4444', zIndex: 10, pointerEvents: 'none' }}>
                                     <div style={{ position: 'absolute', left: '0', top: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></div>
                                </div>
                            )}

                            {/* Events */}
                            {events.filter(e => e.dayIndex === index).map(event => (
                                <div key={event.id} style={{
                                    position: 'absolute',
                                    top: `${Math.max(0, event.startSlotIndex) * 100}px`,
                                    left: '4px',
                                    right: '4px',
                                    height: `${event.duration * 100}px`,
                                    background: event.type === 'club' ? '#FFEDD5' : (event.type === 'class-purple' ? '#F3E8FF' : '#DBEAFE'),
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${event.type === 'club' ? '#F97316' : (event.type === 'class-purple' ? '#9333EA' : '#2563EB')}`,
                                    padding: '8px',
                                    zIndex: 5,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: event.type === 'club' ? '#C2410C' : (event.type === 'class-purple' ? '#7E22CE' : '#1D4ED8') }}>{event.time}</div>
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '4px', lineHeight: '1.2' }}>{event.title}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentSchedule;
