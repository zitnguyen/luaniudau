import React, { useState, useEffect } from "react";
import assessmentService from "../../../services/assessmentService";
import axiosClient from "../../../api/axiosClient"; // Use direct axiosClient for student fetch

const ParentAssessmentList = () => {
    const [children, setChildren] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Parent User
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (user?._id) {
            fetchChildren(user._id);
        }
    }, []);

    useEffect(() => {
        if (selectedStudentId) {
            fetchAssessments(selectedStudentId);
        } else {
            setAssessments([]);
        }
    }, [selectedStudentId]);

    const fetchChildren = async (parentId) => {
        try {
            // Use existing valid endpoint
            const res = await axiosClient.get(`/students/parent/${parentId}`);
            setChildren(res);
            if (res.length > 0) {
                setSelectedStudentId(res[0]._id);
            }
        } catch (error) {
            console.error("Failed to fetch children", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssessments = async (studentId) => {
        try {
            // Need assessmentService.getByStudent
            const res = await assessmentService.getByStudent(studentId);
            setAssessments(res);
        } catch (error) {
            console.error("Failed to fetch assessments", error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-blue-800">Kết Quả Học Tập</h1>

            {loading ? (
                <div>Đang tải dữ liệu...</div>
            ) : children.length === 0 ? (
                <div className="text-gray-500">Chưa tìm thấy thông tin học viên liên kết với tài khoản này.</div>
            ) : (
                <>
                    {/* Student Selector (only if multiple children) */}
                    {children.length > 1 && (
                        <div className="mb-6">
                            <label className="mr-2 font-medium">Chọn bé:</label>
                            <select 
                                className="border p-2 rounded"
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                                {children.map(child => (
                                    <option key={child._id} value={child._id}>{child.fullName}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Assessment List */}
                    <div className="space-y-4">
                        {assessments.map(a => (
                            <div key={a._id} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">
                                        {a.type === 'MidTerm' ? 'Đánh giá Giữa kỳ' : 
                                         a.type === 'EndTerm' ? 'Đánh giá Cuối kỳ' : 'Đánh giá Thường xuyên'}
                                    </h3>
                                    <span className="text-gray-500 text-sm">{new Date(a.date).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="text-gray-600 font-medium">Điểm số: </span>
                                    <span className="text-2xl font-bold text-blue-600">{a.score}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded text-gray-700 italic">
                                    "{a.comment}"
                                </div>
                                <div className="mt-2 text-sm text-gray-500 text-right">
                                    Giáo viên: {a.teacherId?.fullName}
                                </div>
                            </div>
                        ))}
                        {assessments.length === 0 && (
                            <div className="text-center text-gray-500 py-8">Chưa có đánh giá nào cho bé.</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ParentAssessmentList;
