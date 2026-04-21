import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import notificationService from "../../../services/notificationService";

const NotificationListPage = ({ basePath = "/notifications" }) => {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await notificationService.getMine({ force: true });
        setItems(Array.isArray(res?.items) ? res.items : []);
        setUnreadCount(Number(res?.unreadCount || 0));
      } catch (e) {
        setError(
          e?.response?.status === 429
            ? "Hệ thống đang giới hạn tần suất tải, vui lòng thử lại sau vài giây."
            : "Không thể tải notification.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <span className="text-sm text-gray-500">
          Chưa đọc: <strong>{unreadCount}</strong>
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500 text-sm">Đang tải dữ liệu...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-gray-500 text-sm">Bạn chưa có thông báo nào.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <Link
                to={`${basePath}/${item.id}`}
                key={`${item.id}-${item.recipientId || "creator"}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      {!item.isRead && (
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.content}
                    </p>
                    <div className="text-xs text-gray-400 mt-2">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString("vi-VN")
                        : "--"}
                    </div>
                  </div>
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.isRead
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {item.isRead ? "Đã đọc" : "Chưa đọc"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationListPage;
