import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Loader2, Eye, EyeOff, Lock, KeyRound, ShieldCheck } from "lucide-react";
import parentService from "../../../services/parentService";
import KeyboardForm from "../../../components/keyboard/KeyboardForm";

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

  // ── Password section (admin only, edit mode) ──
  const [currentPassword, setCurrentPassword]   = useState("");
  const [showCurrentPw, setShowCurrentPw]       = useState(false);
  const [loadingCurrentPw, setLoadingCurrentPw] = useState(false);
  const [currentPwError, setCurrentPwError]     = useState(null);

  const [newPassword, setNewPassword]           = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [showNewPw, setShowNewPw]               = useState(false);
  const [showConfirmPw, setShowConfirmPw]       = useState(false);
  const [pwError, setPwError]                   = useState(null);
  const [pwSuccess, setPwSuccess]               = useState(false);
  const [submittingPw, setSubmittingPw]         = useState(false);

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

  // Xem mật khẩu hiện tại (admin)
  const handleViewCurrentPassword = async () => {
    try {
      setLoadingCurrentPw(true);
      setCurrentPwError(null);
      const data = await parentService.getPassword(id);
      setCurrentPassword(data.password || data);
      setShowCurrentPw(true);
    } catch (err) {
      setCurrentPwError(err.response?.data?.message || "Không thể lấy mật khẩu");
    } finally {
      setLoadingCurrentPw(false);
    }
  };

  // Đặt lại mật khẩu (admin, không cần mật khẩu cũ)
  const handleResetPassword = async () => {
    setPwError(null);
    setPwSuccess(false);
    if (!newPassword || newPassword.length < 6) {
      setPwError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      setSubmittingPw(true);
      await parentService.resetPassword(id, newPassword);
      setPwSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setShowCurrentPw(false);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.response?.data?.message || "Có lỗi xảy ra khi đặt lại mật khẩu");
    } finally {
      setSubmittingPw(false);
    }
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
      let savedParent = null;
      if (isEditMode) {
        savedParent = await parentService.update(id, formData);
      } else {
        savedParent = await parentService.create(formData);
      }
      navigate("/parents", {
        state: {
          updatedParent: savedParent || null,
          updatedAt: Date.now(),
        },
      });
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
          <span className="ml-2 text-muted-foreground">Đang tải dữ liệu...</span>
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/parents")} 
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isEditMode ? "Sửa thông tin Phụ huynh" : "Thêm Phụ huynh mới"}</h1>
            <p className="text-sm text-muted-foreground">Nhập thông tin cá nhân và liên lạc của phụ huynh</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
            </div>
          )}
          
          <KeyboardForm
            onSubmit={handleSubmit}
            onCancel={() => navigate("/parents")}
            className="space-y-6"
          >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">Họ và Tên <span className="text-red-500">*</span></label>
                      <div className="relative">
                          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input 
                              type="text" 
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              placeholder="Nguyễn Văn A" 
                              required
                              className="block w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all outline-none"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                      <div className="relative">
                          <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input 
                              type="text" 
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="0912..." 
                              required
                              className="block w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all outline-none"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <div className="relative">
                          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input 
                              type="email" 
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="email@example.com" 
                              className="block w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all outline-none"
                          />
                      </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">Địa chỉ</label>
                      <div className="relative">
                          <MapPin size={18} className="absolute left-3 top-3 text-muted-foreground" />
                          <textarea 
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              placeholder="Số nhà, Tên đường..."
                              rows={3}
                              className="block w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all outline-none resize-none"
                          />
                      </div>
                  </div>
              </div>

              {/* ── Password section (chỉ hiện ở edit mode) ── */}
              {isEditMode && (
                <div className="pt-6 border-t border-border space-y-5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Quản lý mật khẩu <span className="text-xs text-muted-foreground font-normal">(Quyền Admin)</span></h3>
                  </div>

                  {/* Xem mật khẩu hiện tại */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Mật khẩu hiện tại</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type={showCurrentPw ? "text" : "password"}
                          readOnly
                          value={currentPassword}
                          placeholder={currentPassword ? "" : "Nhấn nút bên phải để xem..."}
                          className="block w-full pl-10 pr-10 py-2.5 bg-muted/30 border border-border rounded-xl outline-none text-sm cursor-default text-muted-foreground"
                        />
                        {currentPassword && (
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleViewCurrentPassword}
                        disabled={loadingCurrentPw}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted/50 transition-colors disabled:opacity-60 whitespace-nowrap"
                      >
                        {loadingCurrentPw
                          ? <Loader2 size={15} className="animate-spin" />
                          : <Eye size={15} />
                        }
                        {currentPassword ? "Làm mới" : "Xem mật khẩu"}
                      </button>
                    </div>
                    {currentPwError && (
                      <p className="mt-1.5 text-xs text-red-500">{currentPwError}</p>
                    )}
                  </div>

                  {/* Đặt mật khẩu mới */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Mật khẩu mới</label>
                      <div className="relative">
                        <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type={showNewPw ? "text" : "password"}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Tối thiểu 6 ký tự"
                          className="block w-full pl-10 pr-10 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Xác nhận mật khẩu mới</label>
                      <div className="relative">
                        <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type={showConfirmPw ? "text" : "password"}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu mới"
                          className="block w-full pl-10 pr-10 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {pwError && (
                    <p className="text-xs text-red-500">{pwError}</p>
                  )}
                  {pwSuccess && (
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <ShieldCheck size={14} /> Đặt lại mật khẩu thành công!
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={submittingPw || !newPassword || !confirmPassword}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-amber-500 rounded-xl hover:bg-amber-600 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingPw
                      ? <Loader2 size={16} className="animate-spin" />
                      : <KeyRound size={16} />
                    }
                    {submittingPw ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                  <button 
                    type="button" 
                    onClick={() => navigate("/parents")} 
                    className="px-5 py-2.5 text-sm font-medium text-foreground bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    data-keyboard-primary
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed" 
                    disabled={submitting}
                  >
                      {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      <span>{submitting ? "Đang lưu..." : "Lưu thông tin"}</span>
                  </button>
              </div>
          </KeyboardForm>
      </div>
    </div>
  );
};

export default ParentForm;
