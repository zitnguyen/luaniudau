import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import notificationService from "../../../services/notificationService";

const NotificationDetailPage = ({ basePath = "/notifications" }) => {
  const { id } = useParams();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await notificationService.getById(id);
        setNotification(data || null);

        if (data && data.isRead === false) {
          await notificationService.markRead(id, true);
          setNotification((prev) => (prev ? { ...prev, isRead: true } : prev));
        }
      } catch (e) {
        setError(e?.response?.data?.message || "Không thể tải chi tiết notification.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const toggleReadState = async () => {
    if (!notification) return;
    try {
      setToggling(true);
      const nextRead = !notification.isRead;
      await notificationService.markRead(id, nextRead);
      setNotification((prev) =>
        prev ? { ...prev, isRead: nextRead, readAt: nextRead ? new Date() : null } : prev,
      );
    } catch (e) {
      setError(e?.response?.data?.message || "Cập nhật trạng thái đọc thất bại.");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <Link to={basePath} className="text-sm text-gray-500 hover:text-gray-900">
        ← Quay lại danh sách notifications
      </Link>

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-500 text-sm">
          Đang tải chi tiết...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
          {error}
        </div>
      ) : notification ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{notification.title}</h1>
            <button
              onClick={toggleReadState}
              disabled={toggling}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
            >
              {toggling
                ? "Đang cập nhật..."
                : notification.isRead
                  ? "Đánh dấu chưa đọc"
                  : "Đánh dấu đã đọc"}
            </button>
          </div>
          <div className="text-xs text-gray-400">
            Gửi lúc:{" "}
            {notification.createdAt
              ? new Date(notification.createdAt).toLocaleString("vi-VN")
              : "--"}
          </div>
          <div className="text-xs text-gray-500">
            Người gửi:{" "}
            {notification.createdBy?.fullName ||
              notification.createdBy?.username ||
              "System"}
          </div>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {notification.content}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-500 text-sm">
          Notification không tồn tại.
        </div>
      )}
    </div>
  );
};

export default NotificationDetailPage;
