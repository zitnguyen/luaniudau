import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import authService from "../../../services/authService";
import chatService from "../../../services/chatService";
import userService from "../../../services/userService";
import { ImagePlus, Loader2 } from "lucide-react";

const ChatPage = () => {
  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?._id || currentUser?.userId;
  const isAdmin = String(currentUser?.role || "").toLowerCase() === "admin";
  const [contacts, setContacts] = useState([]);
  const [activityUsers, setActivityUsers] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [unreadBySender, setUnreadBySender] = useState({});
  const messagesContainerRef = useRef(null);

  const loadContacts = useCallback(async () => {
    try {
      setError("");
      const data = await chatService.getContacts();
      const list = Array.isArray(data) ? data : [];
      setContacts(list);
      setSelectedContactId((prevId) => {
        if (prevId && list.some((item) => String(item._id) === String(prevId))) return prevId;
        return list.length > 0 ? list[0]._id : "";
      });
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể tải danh sách chat.");
    } finally {
      setLoading(false);
    }
  }, []);

  const selectedContact = useMemo(
    () => contacts.find((c) => String(c._id) === String(selectedContactId)),
    [contacts, selectedContactId],
  );
  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const unreadA = Number(unreadBySender[String(a._id)] || 0);
      const unreadB = Number(unreadBySender[String(b._id)] || 0);
      if (unreadA !== unreadB) return unreadB - unreadA;
      const timeA = a?.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b?.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      return String(a.fullName || a.username || "").localeCompare(
        String(b.fullName || b.username || ""),
        "vi",
      );
    });
  }, [contacts, unreadBySender]);
  const onlineContacts = useMemo(() => {
    if (!isAdmin || activityUsers.length === 0) return [];
    const contactIds = new Set(contacts.map((c) => String(c._id)));
    return activityUsers
      .filter((u) => u.isActive && contactIds.has(String(u._id)))
      .sort((a, b) => new Date(b.lastSeenAt || 0) - new Date(a.lastSeenAt || 0));
  }, [activityUsers, contacts, isAdmin]);

  const formatRelativeActivity = (lastSeenAt, isActive) => {
    if (isActive) return "Đang hoạt động";
    if (!lastSeenAt) return "Chưa hoạt động";
    const diffMs = Date.now() - new Date(lastSeenAt).getTime();
    if (diffMs < 60 * 1000) return "Vừa hoạt động";
    const mins = Math.floor(diffMs / (60 * 1000));
    if (mins < 60) return `Hoạt động ${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hoạt động ${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `Hoạt động ${days} ngày trước`;
  };

  useEffect(() => {
    setLoading(true);
    loadContacts();
    const timer = window.setInterval(loadContacts, 5000);
    return () => window.clearInterval(timer);
  }, [loadContacts]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    const loadActivity = async () => {
      try {
        const data = await userService.getActivityStatuses();
        const users = Array.isArray(data?.users) ? data.users : [];
        setActivityUsers(users);
      } catch {
        setActivityUsers([]);
      }
    };
    loadActivity();
    const timer = window.setInterval(loadActivity, 30000);
    return () => window.clearInterval(timer);
  }, [isAdmin]);

  useEffect(() => {
    const loadUnreadSummary = async () => {
      try {
        const data = await chatService.getUnreadSummary();
        const bySender =
          data && typeof data.bySender === "object" && data.bySender !== null
            ? data.bySender
            : {};
        setUnreadBySender(bySender);
      } catch {
        setUnreadBySender({});
      }
    };
    loadUnreadSummary();
    const timer = window.setInterval(loadUnreadSummary, 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadConversation = async () => {
      if (!selectedContactId) {
        setMessages([]);
        return;
      }
      try {
        const data = await chatService.getConversation(selectedContactId);
        setMessages(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.response?.data?.message || "Không thể tải tin nhắn.");
      }
    };
    loadConversation();
    const timer = window.setInterval(loadConversation, 5000);
    return () => window.clearInterval(timer);
  }, [selectedContactId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, selectedContactId]);

  const handleSend = async () => {
    if (!selectedContactId || !content.trim()) return;
    try {
      setSending(true);
      setError("");
      const created = await chatService.sendMessage(selectedContactId, content.trim());
      setMessages((prev) => [...prev, created]);
      setContent("");
      setUnreadBySender((prev) => ({ ...prev, [String(selectedContactId)]: 0 }));
      setContacts((prev) =>
        prev.map((contact) =>
          String(contact._id) === String(selectedContactId)
            ? { ...contact, lastMessageAt: created?.createdAt || new Date().toISOString() }
            : contact,
        ),
      );
    } catch (e) {
      setError(e?.response?.data?.message || "Gửi tin nhắn thất bại.");
    } finally {
      setSending(false);
    }
  };

  const handleSendImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedContactId) return;
    try {
      setUploadingImage(true);
      setError("");
      const imageUrl = await chatService.uploadChatImage(file);
      if (!imageUrl) throw new Error("Không upload được ảnh");
      const created = await chatService.sendMessage(selectedContactId, "", imageUrl);
      setMessages((prev) => [...prev, created]);
      setUnreadBySender((prev) => ({ ...prev, [String(selectedContactId)]: 0 }));
      setContacts((prev) =>
        prev.map((contact) =>
          String(contact._id) === String(selectedContactId)
            ? { ...contact, lastMessageAt: created?.createdAt || new Date().toISOString() }
            : contact,
        ),
      );
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Gửi ảnh thất bại.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-90px)]">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm h-full flex overflow-hidden">
        <aside className="w-72 border-r border-gray-100 p-3 overflow-y-auto">
          <div className="text-sm font-semibold text-gray-800 px-2 py-2">Cuộc trò chuyện</div>
          {isAdmin && (
            <div className="mb-3 px-2">
              <div className="text-xs font-semibold text-green-700 mb-2">
                Đang online ({onlineContacts.length})
              </div>
              {onlineContacts.length === 0 ? (
                <div className="text-xs text-gray-400 mb-2">Chưa có user online.</div>
              ) : (
                <div className="space-y-1 mb-2">
                  {onlineContacts.slice(0, 8).map((user) => (
                    <button
                      key={`online-${user._id}`}
                      type="button"
                      onClick={() => setSelectedContactId(user._id)}
                      className={`w-full text-left px-2 py-1.5 rounded-md ${
                        String(user._id) === String(selectedContactId)
                          ? "bg-green-50 text-green-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <span className="text-xs font-medium truncate">
                          {user.fullName || user.username}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="h-px bg-gray-100" />
            </div>
          )}
          {loading ? (
            <div className="text-sm text-gray-500 px-2 py-4">Đang tải...</div>
          ) : contacts.length === 0 ? (
            <div className="text-sm text-gray-500 px-2 py-4">Không có liên hệ khả dụng.</div>
          ) : (
            sortedContacts.map((contact) => (
              <button
                key={contact._id}
                type="button"
                onClick={() => setSelectedContactId(contact._id)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                  String(contact._id) === String(selectedContactId)
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="font-medium truncate">{contact.fullName || contact.username}</div>
                  {Number(unreadBySender[String(contact._id)] || 0) > 0 && (
                    <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                      +{unreadBySender[String(contact._id)]}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {contact.role}
                  {isAdmin ? (
                    (() => {
                      const activity = activityUsers.find(
                        (u) => String(u._id) === String(contact._id),
                      );
                      if (!activity) return "";
                      return ` • ${formatRelativeActivity(activity.lastSeenAt, activity.isActive)}`;
                    })()
                  ) : (
                    ""
                  )}
                </div>
              </button>
            ))
          )}
        </aside>

        <section className="flex-1 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-900">
              {selectedContact ? selectedContact.fullName || selectedContact.username : "Chọn người để chat"}
            </div>
          </div>

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-sm text-gray-500">Chưa có tin nhắn.</div>
            ) : (
              messages.map((msg) => {
                const mine = String(msg.senderId) === String(currentUserId);
                return (
                  <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                        mine ? "bg-primary text-white" : "bg-white text-gray-800 border border-gray-100"
                      }`}
                    >
                      {msg.imageUrl ? (
                        <a href={msg.imageUrl} target="_blank" rel="noreferrer">
                          <img
                            src={msg.imageUrl}
                            alt="chat-upload"
                            className="rounded-lg max-h-56 object-cover mb-1"
                          />
                        </a>
                      ) : null}
                      {msg.content ? <div>{msg.content}</div> : null}
                      <div className={`text-[10px] mt-1 ${mine ? "text-white/80" : "text-gray-400"}`}>
                        {new Date(msg.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
            <label className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 shrink-0">
              {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleSendImage}
                disabled={!selectedContactId || uploadingImage || sending}
              />
            </label>
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Nhập tin nhắn..."
              disabled={!selectedContactId || sending || uploadingImage}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!selectedContactId || !content.trim() || sending || uploadingImage}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm disabled:opacity-60"
            >
              Gửi
            </button>
          </div>
          {error && <div className="px-4 pb-3 text-xs text-red-600">{error}</div>}
        </section>
      </div>
    </div>
  );
};

export default ChatPage;
