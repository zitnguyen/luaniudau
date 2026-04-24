import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProgressAssessmentForm from "../../../components/progress/ProgressAssessmentForm";
import progressService from "../../../services/progressService";
import classService from "../../../services/classService";
import parentService from "../../../services/parentService";
import authService from "../../../services/authService";

const ParentProgressView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const studentId = searchParams.get("studentId") || "";
  const user = authService.getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [teacherFeedback, setTeacherFeedback] = useState({
    strengths: "",
    weaknesses: "",
    improvementPlan: "",
  });
  const [studentName, setStudentName] = useState("");
  const [className, setClassName] = useState("");
  const [classId, setClassId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId || !user?._id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [children, classes] = await Promise.all([
          parentService.getStudents(user._id),
          classService.getAll(),
        ]);
        const child = (Array.isArray(children) ? children : []).find(
          (item) => String(item?._id) === String(studentId),
        );
        if (!child) {
          setLoading(false);
          return;
        }
        setStudentName(child.fullName || "Học viên");

        const matchedClasses = (Array.isArray(classes) ? classes : []).filter((cls) => {
          const students = Array.isArray(cls?.studentIds) ? cls.studentIds : [];
          return students.some(
            (st) => String(st?._id || st) === String(studentId),
          );
        });

        if (!matchedClasses.length) {
          setLoading(false);
          return;
        }

        // Parent may have multiple classes for one child. Pick the class that has saved progress.
        const progressCandidates = await Promise.all(
          matchedClasses.map(async (cls) => {
            try {
              const progress = await progressService.getByStudentClass(studentId, cls._id);
              return { cls, progress };
            } catch {
              return { cls, progress: null };
            }
          }),
        );

        const picked =
          progressCandidates.find(
            ({ progress }) =>
              progress &&
              (Array.isArray(progress.sessions) && progress.sessions.length > 0 ||
                progress?.teacherFeedback?.strengths ||
                progress?.teacherFeedback?.weaknesses ||
                progress?.teacherFeedback?.improvementPlan),
          ) ||
          progressCandidates.find(({ progress }) => Boolean(progress)) ||
          progressCandidates[0];

        setClassId(picked?.cls?._id || "");
        setClassName(picked?.cls?.className || "");
        setSessions(Array.isArray(picked?.progress?.sessions) ? picked.progress.sessions : []);
        setTeacherFeedback(
          picked?.progress?.teacherFeedback || {
            strengths: "",
            weaknesses: "",
            improvementPlan: "",
          },
        );
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId, user?._id]);

  return (
    <ProgressAssessmentForm
      loading={loading}
      saving={false}
      sessions={sessions}
      setSessions={setSessions}
      teacherFeedback={teacherFeedback}
      setTeacherFeedback={setTeacherFeedback}
      onSave={() => {}}
      onDelete={() => {}}
      onExport={
        classId
          ? () => progressService.exportWord(studentId, classId, studentName || "HocVien")
          : undefined
      }
      onBack={() => navigate("/parent/dashboard")}
      backLabel="Quay lại tổng quan"
      title="Phiếu học tập của bé"
      showDelete={false}
      showExport={false}
      readOnly
      studentName={studentName}
      className={className}
    />
  );
};

export default ParentProgressView;
