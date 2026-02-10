import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import parentService from "../../../services/parentService";

const ParentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: ""
  });

  useEffect(() => {
    if (isEditMode) {
      fetchParent();
    }
  }, [id]);

  const fetchParent = async () => {
    try {
      setLoading(true);
      const data = await parentService.getById(id);
      setFormData({
        fullName: data.fullName || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || ""
      });
    } catch (err) {
      setError("Lỗi khi tải thông tin phụ huynh");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
        setError("Vui lòng nhập Họ tên và Số điện thoại");
        return;
    }

    try {
      setSubmitting(true);
      setError(null);
      if (isEditMode) {
        await parentService.update(id, formData);
      } else {
        await parentService.create(formData);
      }
      navigate("/parents");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
      <div className="flex h-96 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/parents")} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? "Sửa thông tin Phụ huynh" : "Thêm Phụ huynh mới"}</h1>
            <p className="text-sm text-gray-500">Nhập thông tin cá nhân và liên lạc của phụ huynh</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ và Tên <span className="text-red-500">*</span></label>
                      <div className="relative">
                          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                              type="text" 
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              placeholder="Nguyễn Văn A" 
                              required
                              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                      <div className="relative">
                          <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                              type="text" 
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="0912..." 
                              required
                              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="relative">
                          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                              type="email" 
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="email@example.com" 
                              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                          />
                      </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                      <div className="relative">
                          <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                          <textarea 
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              placeholder="Số nhà, Tên đường..."
                              rows={3}
                              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none resize-none"
                          />
                      </div>
                  </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-50">
                  <button 
                    type="button" 
                    onClick={() => navigate("/parents")} 
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed" 
                    disabled={submitting}
                  >
                      {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      <span>{submitting ? "Đang lưu..." : "Lưu thông tin"}</span>
                  </button>
              </div>
          </form>
      </div>
    </div>
  );
};

export default ParentForm;
