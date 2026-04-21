import React, { useEffect, useMemo, useState } from "react";
import notificationService from "../../../services/notificationService";
import userService from "../../../services/userService";

const ROLE_OPTIONS = [
  { value: "Teacher", label: "Teacher" },
  { value: "Parent", label: "Parent" },
  { value: "Student", label: "Student" },
];

const AdminNotificationCreate = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedRoles, setSelectedRoles] = useState(["Teacher"]);
  const [recipientMode, setRecipientMode] = useState("allByRole");
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roleLabelMap = useMemo(
    () => Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r.label])),
    [],
  );

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setError("");
        const userGroups = await Promise.all(
          selectedRoles.map((role) => userService.getAll({ role })),
        );
        const merged = userGroups.flatMap((group) =>
          Array.isArray(group) ? group : [],
        );
        const unique = Array.from(
          new Map(merged.map((user) => [String(user._id), user])).values(),
        );
        setUsers(unique);
      } catch (e) {
        setError("Không thể tải danh sách người nhận.");
      } finally {
        setLoadingUsers(false);
      }
    };

    if (selectedRoles.length > 0) {
      loadUsers();
    } else {
      setUsers([]);
      setSelectedUserIds([]);
    }
  }, [selectedRoles]);

  useEffect(() => {
    setSelectedUserIds((prev) => prev.filter((id) => users.some((u) => u._id === id)));
  }, [users]);

  const toggleRole = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const toggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      setError("");
      setMessage("");
      if (!title.trim() || !content.trim()) {
        setError("Vui lòng nhập tiêu đề và nội dung.");
        return;
      }
      if (selectedRoles.length === 0) {
        setError("Vui lòng chọn ít nhất một role nhận.");
        return;
      }
      if (recipientMode === "selectedUsers" && selectedUserIds.length === 0) {
        setError("Vui lòng chọn ít nhất một người nhận.");
        return;
      }

      const payload = {
        title: title.trim(),
        content: content.trim(),
        targetRoles: selectedRoles,
        userIds: recipientMode === "selectedUsers" ? selectedUserIds : [],
      };

      const result = await notificationService.create(payload);
      setMessage(
        `Đã gửi thông báo thành công tới ${result?.recipientsCount || 0} người nhận.`,
      );
      setTitle("");
      setContent("");
      setSelectedUserIds([]);
    } catch (e) {
      setError(e?.response?.data?.message || "Gửi thông báo thất bại.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tạo Notification</h1>
        <p className="text-sm text-gray-500 mt-1">
          Admin gửi thông báo cho Teacher / Parent / Student theo role hoặc theo user cụ thể.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề
          </label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề thông báo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 min-h-[120px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung thông báo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role nhận thông báo
          </label>
          <div className="flex flex-wrap gap-3">
            {ROLE_OPTIONS.map((role) => (
              <label
                key={role.value}
                className="inline-flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.value)}
                  onChange={() => toggleRole(role.value)}
                />
                {role.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chế độ chọn người nhận
          </label>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={recipientMode === "allByRole"}
                onChange={() => setRecipientMode("allByRole")}
              />
              Tất cả user theo role đã chọn
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={recipientMode === "selectedUsers"}
                onChange={() => setRecipientMode("selectedUsers")}
              />
              Chọn user cụ thể (1 hoặc nhiều)
            </label>
          </div>
        </div>

        {recipientMode === "selectedUsers" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh sách người nhận
            </label>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
              {loadingUsers ? (
                <div className="text-sm text-gray-500">Đang tải user...</div>
              ) : users.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Không có user phù hợp role đã chọn.
                </div>
              ) : (
                users.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user._id)}
                      onChange={() => toggleUser(user._id)}
                    />
                    <span className="font-medium">
                      {user.fullName || user.username || "N/A"}
                    </span>
                    <span className="text-gray-400">
                      ({roleLabelMap[user.role] || user.role})
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-60"
        >
          {sending ? "Đang gửi..." : "Gửi Notification"}
        </button>
      </form>
    </div>
  );
};

export default AdminNotificationCreate;
