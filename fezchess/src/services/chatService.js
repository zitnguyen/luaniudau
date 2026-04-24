import axiosClient from "../api/axiosClient";

const chatService = {
  getContacts: () => axiosClient.get("/chat/contacts"),
  getUnreadSummary: () => axiosClient.get("/chat/unread-summary"),
  getConversation: (userId) => axiosClient.get(`/chat/messages/${userId}`),
  sendMessage: (recipientId, content, imageUrl = "") =>
    axiosClient.post("/chat/messages", { recipientId, content, imageUrl }),
  uploadChatImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const data = await axiosClient.post("/upload/chat-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data?.url || "";
  },
};

export default chatService;
