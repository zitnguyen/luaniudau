import React, { useState, useEffect } from "react";
import assessmentService from "../../../../services/assessmentService";
import classService from "../../../../services/classService";

const AssessmentList = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [assessments, setAssessments] = useState([]);
    const [students, setStudents] = useState([]); // Students in selected class
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));

    // Form
    const [formData, setFormData] = useState({
        studentId: "",
        type: "Regular",
        score: 0,
        comment: "",
        date: new Date().toISOString().slice(0, 10),
    });

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchClassData(selectedClassId);
            fetchAssessments(selectedClassId);
        } else {
            setAssessments([]);
            setStudents([]);
        }
    }, [selectedClassId]);

    const fetchClasses = async () => {
        try {
            if (user?._id) {
                const res = await classService.getByTeacher(user._id);
                setClasses(res);
            }
        } catch (error) {
            console.error("Failed to fetch classes", error);
        }
    };

    const fetchClassData = async (classId) => {
        try {
            const res = await classService.getById(classId);
            if (res.enrollments) {
                // Future implementation to get students
            }
             setStudents([]);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAssessments = async (classId) => {
        try {
            const res = await assessmentService.getByClass(classId);
            setAssessments(res);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await assessmentService.create({
                ...formData,
                classId: selectedClassId,
                teacherId: user._id
            });
            alert("Đã lưu đánh giá!");
            setShowModal(false);
            fetchAssessments(selectedClassId);
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi lưu");
        }
    };
    
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Đánh Giá Học Viên</h1>
            
            <div className="mb-6">
                <label className="mr-2 font-medium">Chọn lớp:</label>
                <select 
                    className="border p-2 rounded"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                >
                    <option value="">-- Chọn lớp --</option>
                    {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.className}</option>
                    ))}
                </select>
            </div>

            {selectedClassId && (
                <>
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-xl font-semibold">Danh sách đánh giá</h2>
                         <button 
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            onClick={() => setShowModal(true)}
                         >
                            + Đánh giá mới
                         </button>
                    </div>

                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học viên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhận xét</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-200">
                                {assessments.map(a => (
                                    <tr key={a._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(a.date).toLocaleDateString('vi-VN')}</td>
                                        <td className="px-6 py-4 font-medium">{a.studentId?.fullName || "N/A"}</td>
                                        <td className="px-6 py-4">{
                                            a.type === 'MidTerm' ? 'Giữa kỳ' : 
                                            a.type === 'EndTerm' ? 'Cuối kỳ' : 'Thường xuyên'
                                        }</td>
                                        <td className="px-6 py-4 font-bold text-blue-600">{a.score}</td>
                                        <td className="px-6 py-4 text-gray-600">{a.comment}</td>
                                    </tr>
                                ))}
                                {assessments.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Chưa có đánh giá nào</td>
                                    </tr>
                                )}
                             </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Thêm Đánh Giá</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium">Mã Học Viên / Tên (Tạm thời nhập ID)</label>
                                <input 
                                    className="w-full border p-2 rounded"
                                    value={formData.studentId}
                                    onChange={e => setFormData({...formData, studentId: e.target.value})}
                                    placeholder="Nhập Student ID"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    *Cần chọn từ danh sách (Đang cập nhật API lấy danh sách học viên)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Loại đánh giá</label>
                                <select 
                                    className="w-full border p-2 rounded"
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="Regular">Thường xuyên</option>
                                    <option value="MidTerm">Giữa kỳ</option>
                                    <option value="EndTerm">Cuối kỳ</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Điểm số (0-10)</label>
                                <input 
                                    type="number" step="0.1" min="0" max="10"
                                    className="w-full border p-2 rounded"
                                    value={formData.score}
                                    onChange={e => setFormData({...formData, score: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Nhận xét</label>
                                <textarea 
                                    className="w-full border p-2 rounded"
                                    rows="3"
                                    value={formData.comment}
                                    onChange={e => setFormData({...formData, comment: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssessmentList;
