import axiosClient from "../api/axiosClient";

const getFilenameFromDisposition = (disposition, fallback) => {
  if (!disposition) return fallback;
  const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      return fallback;
    }
  }
  const plain = disposition.match(/filename="([^"]+)"/i);
  if (plain?.[1]) return plain[1];
  return fallback;
};

const progressService = {
  getByStudentClass: (studentId, classId) =>
    axiosClient.get(`/progress/${studentId}/${classId}`),

  save: (payload) => axiosClient.post("/progress", payload),

  remove: (studentId, classId) =>
    axiosClient.delete(`/progress/${studentId}/${classId}`),

  exportWord: async (studentId, classId, fallbackStudentName = "HocVien") => {
    try {
      const response = await axiosClient.get(
        `/progress/export/${studentId}/${classId}`,
        { responseType: "blob" },
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const fallback = `PhieuHocTap_${fallbackStudentName}.docx`;
      const disposition = response?.headers?.["content-disposition"] || "";
      const filename = getFilenameFromDisposition(disposition, fallback);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      let message = "Xuất file Word thất bại";
      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed?.message) message = parsed.message;
        } catch {
          // keep default message
        }
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      throw new Error(message);
    }
  },
};

export default progressService;
