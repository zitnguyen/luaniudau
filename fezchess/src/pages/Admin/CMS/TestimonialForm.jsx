import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Loader2, Save } from "lucide-react";
import testimonialService from "../../../services/testimonialService";

const TestimonialForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    content: "",
    image: "",
    rating: 5,
    sortOrder: 0,
    isPublished: true,
  });

  useEffect(() => {
    if (!isEditMode) return;
    const fetchData = async () => {
      try {
        const data = await testimonialService.getById(id);
        setFormData({
          name: data?.name || "",
          role: data?.role || "",
          content: data?.content || "",
          image: data?.image || "",
          rating: Number(data?.rating || 5),
          sortOrder: Number(data?.sortOrder || 0),
          isPublished: Boolean(data?.isPublished),
        });
      } catch (error) {
        console.error("Error loading testimonial:", error);
        alert("Không thể tải dữ liệu đánh giá.");
        navigate("/cms/testimonials");
      }
    };
    fetchData();
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        rating: Number(formData.rating),
        sortOrder: Number(formData.sortOrder),
      };
      if (isEditMode) {
        await testimonialService.update(id, payload);
      } else {
        await testimonialService.create(payload);
      }
      navigate("/cms/testimonials");
    } catch (error) {
      console.error("Error saving testimonial:", error);
      alert(error?.response?.data?.message || "Lưu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setImageUploading(true);
      const uploadedUrl = await testimonialService.uploadImage(file);
      if (!uploadedUrl) throw new Error("Không lấy được URL ảnh");
      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error?.response?.data?.message || error.message || "Upload ảnh thất bại.");
    } finally {
      setImageUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/cms/testimonials")}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Quay lại danh sách
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? "Chỉnh sửa đánh giá" : "Thêm đánh giá mới"}
        </h1>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
        >
          <Save className="w-5 h-5" />
          {loading ? "Đang lưu..." : "Lưu"}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên người đánh giá
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò/mô tả
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              placeholder="Ví dụ: Phụ huynh bé Minh Anh"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung đánh giá
          </label>
          <textarea
            required
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary min-h-[140px]"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Điểm sao (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              value={formData.isPublished ? "true" : "false"}
              onChange={(e) =>
                setFormData({ ...formData, isPublished: e.target.value === "true" })
              }
            >
              <option value="true">Hiển thị</option>
              <option value="false">Ẩn</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ảnh đại diện (URL)
          </label>
          <div className="mb-3 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              {imageUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ImagePlus size={16} />
              )}
              <span className="text-sm">
                {imageUploading ? "Đang upload..." : "Chọn ảnh từ máy"}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleImagePick}
              />
            </label>
          </div>
          <input
            type="text"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            placeholder="https://..."
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />
          {formData.image && (
            <div className="mt-3 w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default TestimonialForm;
