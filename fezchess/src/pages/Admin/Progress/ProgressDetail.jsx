import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import ProgressAssessmentForm from "../../../components/progress/ProgressAssessmentForm";
import progressService from "../../../services/progressService";

const ProgressDetail = () => {
  const { studentId, classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [sessions, setSessions] = useState([]);
  const [teacherFeedback, setTeacherFeedback] = useState({
    strengths: "",
    weaknesses: "",
    improvementPlan: "",
  });
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
        progressService
          .getByStudentClass(studentId, classId)
          .catch((err) => null),
        axiosClient.get(
          `/attendance?studentId=${studentId}&classId=${classId}`,
        ),
      ]);

      if (progressData) {
        setSessions(progressData.sessions || []);
        setTeacherFeedback(
          progressData.teacherFeedback || {
            strengths: "",
            weaknesses: "",
            improvementPlan: "",
          },
        );
      }

      if (attendanceData) {
        // Merge attendance dates into sessions or prepare them for selection
        // Actually, we want to auto-populate sessions based on attendance
        setAttendanceRecords(attendanceData);

        if (
          !progressData ||
          !progressData.sessions ||
          progressData.sessions.length === 0
        ) {
          // Initialize sessions from attendance
          const initSessions = attendanceData.map((att) => ({
            attendanceId: att._id,
            date: att.date,
            content: "",
            assessment: "",
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
        sessions: sessions.map((s) => ({
          attendanceId: s.attendanceId,
          content: s.content,
          assessment: s.assessment,
        })),
        teacherFeedback,
      };

      // Upsert logic
      await progressService.save(payload);
      alert("Lưu thành công!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Lỗi khi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa phiếu học tập này không? Hành động này không thể hoàn tác.",
      )
    ) {
      try {
        await progressService.remove(studentId, classId);
        alert("Đã xóa phiếu học tập thành công!");
        navigate("/progress");
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Lỗi khi xóa phiếu học tập");
      }
    }
  };

  const handleExport = async () => {
    try {
      await progressService.exportWord(
        studentId,
        classId,
        studentInfo?.fullName || "HocVien",
      );
    } catch (error) {
      alert(error?.message || "Lỗi khi xuất file Word");
    }
  };
  return (
    <ProgressAssessmentForm
      loading={loading}
      saving={saving}
      sessions={sessions}
      setSessions={setSessions}
      teacherFeedback={teacherFeedback}
      setTeacherFeedback={setTeacherFeedback}
      onSave={handleSave}
      onDelete={handleDelete}
      onExport={handleExport}
      onBack={() => navigate("/progress")}
      backLabel="Quay lại danh sách"
      title="Chi Tiết Phiếu Học Tập"
      showDelete
      showExport
    />
  );
};

export default ProgressDetail;
