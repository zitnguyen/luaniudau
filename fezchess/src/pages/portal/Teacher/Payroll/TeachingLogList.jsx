import React, { useState, useEffect } from "react";
import teachingLogService from "../../../../services/teachingLogService";
import classService from "../../../../services/classService";

const TeachingLogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  // Form State
  const [formData, setFormData] = useState({
    classId: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "",
    endTime: "",
    note: "",
  });

  useEffect(() => {
    fetchLogs();
    fetchClasses();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await teachingLogService.getMyLogs();
      setLogs(res);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
    }
  };

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

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return diff > 0 ? (diff / 60).toFixed(2) : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const durationHours = calculateDuration(formData.startTime, formData.endTime);
    
    if (durationHours <= 0) {
        alert("Thời gian kết thúc phải sau thời gian bắt đầu");
        return;
    }

    try {
      await teachingLogService.create({ ...formData, durationHours });
      alert("Đã lưu ca dạy!");
      setShowModal(false);
      fetchLogs();
      setFormData({
        classId: "",
        date: new Date().toISOString().slice(0, 10),
        startTime: "",
        endTime: "",
        note: "",
      });
    } catch (error) {
      alert("Lỗi khi lưu: " + error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bảng Lương & Ca Dạy</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Ghi Nhận Ca Dạy
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số giờ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log._id}>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(log.date).toLocaleDateString('vi-VN')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{log.classId?.className || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{log.startTime} - {log.endTime}</td>
                <td className="px-6 py-4 whitespace-nowrap">{log.durationHours}h</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${log.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                      log.status === 'Paid' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {log.status === 'Pending' ? 'Đang duyệt' : 
                     log.status === 'Confirmed' ? 'Đã duyệt' : 
                     log.status === 'Paid' ? 'Đã t.toán' : log.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ghi Nhận Ca Dạy</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ngày dạy</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Lớp học</label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                >
                    <option value="">-- Chọn lớp --</option>
                    {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.className}</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700">Bắt đầu</label>
                   <input
                     type="time"
                     required
                     value={formData.startTime}
                     onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">Kết thúc</label>
                   <input
                     type="time"
                     required
                     value={formData.endTime}
                     onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  rows="3"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachingLogList;
