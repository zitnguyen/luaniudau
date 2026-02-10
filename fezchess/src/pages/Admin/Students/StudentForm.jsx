import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import studentService from "../../../services/studentService";
import teacherService from "../../../services/teacherService";
import scheduleService from "../../../services/scheduleService";

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const formRef = useRef(null);
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [teachers, setTeachers] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
    skillLevel: "",
    address: "",
    teacherId: "",

    parentName: "",
    parentPhone: "",
    parentEmail: "",

    scheduleDays: [],
    scheduleTimes: {},
    sessionsTotal: 16,
  });

  useEffect(() => {
    fetchTeachers();
    if (isEditMode) fetchStudent();
    // eslint-disable-next-line
  }, [id]);

  const fetchTeachers = async () => {
    try {
      const res = await teacherService.getAll();
      setTeachers(res || []);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    }
  };

  // ================= FETCH STUDENT + SCHEDULE =================
  const fetchStudent = async () => {
    try {
      setLoading(true);

      const student = await studentService.getById(id);
      if (!student) throw new Error("Student not found");

      const schedule = await scheduleService.getByStudentId(id);

      let days = [];
      let times = {};

      if (schedule?.slots?.length) {
        schedule.slots.forEach((slot) => {
          days.push(slot.day);
          times[slot.day] = slot.time;
        });
      }

      setFormData({
        fullName: student?.fullName || "",
        dateOfBirth: student?.dateOfBirth
          ? student.dateOfBirth.split("T")[0]
          : "",
        enrollmentDate: student?.enrollmentDate
          ? student.enrollmentDate.split("T")[0]
          : "",
        skillLevel: student?.skillLevel || "",
        address: student?.address || "",
        teacherId: student?.teacherId?._id || student?.teacherId || "",

        parentName: student?.parentId?.fullName || "",
        parentPhone: student?.parentId?.phone || "",
        parentEmail: student?.parentId?.email || "",

        scheduleDays: days,
        scheduleTimes: times,
        sessionsTotal: student?.sessions?.total || 16,
      });
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải dữ liệu học viên");
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (dayVal) => {
    setFormData((prev) => {
      const exists = prev.scheduleDays.includes(dayVal);

      const newDays = exists
        ? prev.scheduleDays.filter((d) => d !== dayVal)
        : [...prev.scheduleDays, dayVal].sort();

      const newTimes = { ...prev.scheduleTimes };

      if (!exists && !newTimes[dayVal]) {
        const firstKey = Object.keys(newTimes)[0];
        newTimes[dayVal] = firstKey ? newTimes[firstKey] : "18:00";
      }

      if (exists) delete newTimes[dayVal];

      return {
        ...prev,
        scheduleDays: newDays,
        scheduleTimes: newTimes,
      };
    });
  };

  const handleTimeChange = (day, time) => {
    setFormData((prev) => ({
      ...prev,
      scheduleTimes: {
        ...prev.scheduleTimes,
        [day]: time,
      },
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName) return setError("Vui lòng nhập tên học viên");
    if (!formData.parentPhone) return setError("Vui lòng nhập SĐT phụ huynh");
    if (formData.scheduleDays.length === 0)
      return setError("Vui lòng chọn ít nhất 1 buổi học");

    const studentPayload = {
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      enrollmentDate: formData.enrollmentDate,
      skillLevel: formData.skillLevel,
      address: formData.address,
      teacherId: formData.teacherId,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
      sessionsTotal: formData.sessionsTotal,
    };

    const scheduleSlots = formData.scheduleDays.map((d) => ({
      day: d,
      time: formData.scheduleTimes[d] || "18:00",
    }));

    try {
      setSubmitting(true);

      let studentId = id;

      if (isEditMode) {
        await studentService.update(id, studentPayload);
      } else {
        const created = await studentService.create(studentPayload);
        studentId = created._id;
      }

      await scheduleService.upsertByStudentId(studentId, {
        slots: scheduleSlots,
      });

      navigate("/students");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi khi lưu dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* JSX UI của bạn giữ nguyên */}
    </div>
  );
};

export default StudentForm;
