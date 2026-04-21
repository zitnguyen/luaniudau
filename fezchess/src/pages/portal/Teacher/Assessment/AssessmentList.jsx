import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../../../api/axiosClient";
import teacherDashboardService from "../../../../services/teacherDashboardService";
import ProgressAssessmentForm from "../../../../components/progress/ProgressAssessmentForm";
import progressService from "../../../../services/progressService";

const AssessmentList = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [teacherFeedback, setTeacherFeedback] = useState({
    strengths: "",
    weaknesses: "",
    improvementPlan: "",
  });
  const [progressId, setProgressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setInitLoading(true);
        setError("");
        const [classRes, studentRes] = await Promise.all([
          teacherDashboardService.getClasses(),
          teacherDashboardService.getStudents(),
        ]);
        const classList = Array.isArray(classRes) ? classRes : [];
        const studentList = Array.isArray(studentRes) ? studentRes : [];
        setClasses(classList);
        setStudents(studentList);

        if (classList.length > 0) {
          setSelectedClassId(classList[0]._id);
        }
      } catch (e) {
        setError("Không thể tải danh sách lớp/học viên của giáo viên.");
      } finally {
        setInitLoading(false);
      }
    };

    fetchInitial();
  }, []);

  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter(
      (student) => String(student.classId) === String(selectedClassId),
    );
  }, [students, selectedClassId]);

  useEffect(() => {
    if (classStudents.length === 0) {
      setSelectedStudentId("");
      return;
    }
    const stillExists = classStudents.some(
      (student) => String(student._id) === String(selectedStudentId),
    );
    if (!stillExists) {
      setSelectedStudentId(classStudents[0]._id);
    }
  }, [classStudents, selectedStudentId]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!selectedClassId || !selectedStudentId) {
        setProgressId(null);
        setSessions([]);
        setTeacherFeedback({ strengths: "", weaknesses: "", improvementPlan: "" });
        return;
      }

      try {
        setLoading(true);
        setError("");
        const [progressData, attendanceData] = await Promise.all([
          axiosClient
            .get(`/progress/${selectedStudentId}/${selectedClassId}`)
            .catch(() => null),
          axiosClient.get(
            `/attendance?studentId=${selectedStudentId}&classId=${selectedClassId}`,
          ),
        ]);

        if (progressData) {
          setProgressId(progressData._id || null);
          setSessions(progressData.sessions || []);
          setTeacherFeedback(
            progressData.teacherFeedback || {
              strengths: "",
              weaknesses: "",
              improvementPlan: "",
            },
          );
        } else {
          setProgressId(null);
        }

        if (
          (!progressData || !Array.isArray(progressData.sessions) || progressData.sessions.length === 0) &&
          Array.isArray(attendanceData)
        ) {
          const initSessions = attendanceData.map((att) => ({
            attendanceId: att._id,
            date: att.date,
            content: "",
            assessment: "",
          }));
          setSessions(initSessions);
        }
      } catch (e) {
        const status = e?.response?.status;
        if (status === 403) {
          setError("Bạn không có quyền đánh giá học viên/lớp này.");
        } else {
          setError("Không thể tải dữ liệu đánh giá học viên.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [selectedClassId, selectedStudentId]);

  const handleSave = async () => {
    if (!selectedClassId || !selectedStudentId) return;

    try {
      setSaving(true);
      setError("");
      const payload = {
        studentId: selectedStudentId,
        classId: selectedClassId,
        sessions: sessions.map((item) => ({
          attendanceId: item.attendanceId?._id ?? item.attendanceId,
          content: item.content || "",
          assessment: item.assessment || "",
        })),
        teacherFeedback,
      };

      if (progressId) {
        const updated = await axiosClient.put(
          `/teacher/assessments/${progressId}`,
          payload,
        );
        setProgressId(updated?._id || progressId);
      } else {
        const created = await axiosClient.post("/teacher/assessments", payload);
        setProgressId(created?._id || null);
      }
      alert("Lưu đánh giá thành công!");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 403) {
        setError("Không được phép thao tác đánh giá cho học viên này.");
      } else {
        setError(e?.response?.data?.message || "Lưu đánh giá thất bại.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!selectedClassId || !selectedStudentId) return;
    if (!progressId) {
      setError("Chưa có phiếu học tập để xuất. Vui lòng lưu đánh giá trước.");
      return;
    }

    try {
      setError("");
      await progressService.exportWord(
        selectedStudentId,
        selectedClassId,
        selectedStudent?.fullName || "HocVien",
      );
    } catch (e) {
      const status = e?.response?.status;
      const errorBlob = e?.response?.data;
      if (errorBlob instanceof Blob) {
        try {
          const text = await errorBlob.text();
          const parsed = JSON.parse(text);
          if (parsed?.message) {
            setError(parsed.message);
            return;
          }
        } catch {
          // Ignore parse error and use fallback message below.
        }
      }
      if (status === 403) {
        setError("Bạn không có quyền xuất phiếu học tập này.");
      } else if (status === 404) {
        setError("Phiếu học tập chưa tồn tại. Hãy lưu trước khi xuất file.");
      } else {
        setError("Xuất file Word thất bại.");
      }
    }
  };

  if (initLoading) {
    return <div className="p-6 text-gray-500">Đang tải dữ liệu...</div>;
  }

  if (classes.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-600">
          Bạn chưa được phân công lớp học nào nên chưa thể đánh giá học viên.
        </div>
      </div>
    );
  }

  const selectedClass = classes.find(
    (item) => String(item._id) === String(selectedClassId),
  );
  const selectedStudent = classStudents.find(
    (item) => String(item._id) === String(selectedStudentId),
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Đánh Giá Học Viên</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lớp học
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
            >
              {classes.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.className}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Học viên
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
              disabled={classStudents.length === 0}
            >
              {classStudents.length === 0 ? (
                <option value="">Lớp này chưa có học viên</option>
              ) : (
                classStudents.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.fullName}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
            {error}
          </div>
        )}
      </div>

      {selectedStudentId ? (
        <ProgressAssessmentForm
          loading={loading}
          saving={saving}
          sessions={sessions}
          setSessions={setSessions}
          teacherFeedback={teacherFeedback}
          setTeacherFeedback={setTeacherFeedback}
          onSave={handleSave}
          onDelete={null}
          onExport={handleExport}
          showDelete={false}
          showExport
          onBack={() => {
            setSelectedStudentId("");
          }}
          backLabel="Chọn học viên khác"
          title="Đánh Giá Học Tập"
          studentName={selectedStudent?.fullName}
          className={selectedClass?.className}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-500">
          Vui lòng chọn học viên để bắt đầu đánh giá.
        </div>
      )}
    </div>
  );
};

export default AssessmentList;
