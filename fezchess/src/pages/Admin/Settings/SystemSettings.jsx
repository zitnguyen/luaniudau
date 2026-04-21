import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import settingsService from "../../../services/settingsService";
import { useSystemSettings } from "../../../context/SystemSettingsContext";

const SystemSettings = () => {
  const { settings, loading, refreshSettings, setSettingsOptimistic } = useSystemSettings();
  const [formData, setFormData] = useState(settings);
  const [logoUploading, setLogoUploading] = useState(false);
  const [qrUploading, setQrUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const previewLogo = useMemo(
    () => formData.logoUrl || settings.logoUrl,
    [formData.logoUrl, settings.logoUrl],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoPick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setLogoUploading(true);
      const logoUrl = await settingsService.uploadLogo(file);
      if (!logoUrl) throw new Error("Không lấy được URL logo");
      setFormData((prev) => ({ ...prev, logoUrl }));
      setSettingsOptimistic({ logoUrl });
      toast.success("Upload logo thành công");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Upload logo thất bại");
    } finally {
      setLogoUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        logoUrl: formData.logoUrl || "",
        centerName: formData.centerName || "",
        address: formData.address || "",
        hotline: formData.hotline || "",
        email: formData.email || "",
        workingHours: formData.workingHours || "",
        bankName: formData.bankName || "Techcombank",
        bankAccountNumber: formData.bankAccountNumber || "",
        bankAccountName: formData.bankAccountName || "",
        paymentQrUrl: formData.paymentQrUrl || "",
        paymentTransferPrefix: formData.paymentTransferPrefix || "KHOAHOC",
      };
      const saved = await settingsService.update(payload);
      setSettingsOptimistic(saved);
      await refreshSettings();
      toast.success("Cập nhật thành công");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cập nhật cấu hình thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQrPick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setQrUploading(true);
      const qrUrl = await settingsService.uploadPaymentQr(file);
      if (!qrUrl) throw new Error("Không lấy được URL QR");
      setFormData((prev) => ({ ...prev, paymentQrUrl: qrUrl }));
      setSettingsOptimistic({ paymentQrUrl: qrUrl });
      toast.success("Upload QR thành công");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Upload QR thất bại");
    } finally {
      setQrUploading(false);
      event.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 animate-spin" size={18} />
        Đang tải cấu hình...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Cấu hình hệ thống</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý logo và thông tin trung tâm hiển thị toàn hệ thống.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Logo trung tâm</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
              {previewLogo ? (
                <img src={previewLogo} alt="Logo preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400">No logo</span>
              )}
            </div>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              {logoUploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              <span className="text-sm">{logoUploading ? "Đang upload..." : "Chọn logo"}</span>
              <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoPick} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên trung tâm</label>
            <input name="centerName" value={formData.centerName || ""} onChange={handleChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotline tư vấn</label>
            <input name="hotline" value={formData.hotline || ""} onChange={handleChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ</label>
            <input name="email" type="email" value={formData.email || ""} onChange={handleChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giờ làm việc</label>
            <input name="workingHours" value={formData.workingHours || ""} onChange={handleChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
          <textarea name="address" rows={3} value={formData.address || ""} onChange={handleChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
        </div>

        <div className="border-t pt-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin chuyển khoản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng</label>
              <input name="bankName" value={formData.bankName || ""} onChange={handleChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
              <input name="bankAccountNumber" value={formData.bankAccountNumber || ""} onChange={handleChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chủ tài khoản</label>
              <input name="bankAccountName" value={formData.bankAccountName || ""} onChange={handleChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiền tố nội dung chuyển khoản</label>
              <input name="paymentTransferPrefix" value={formData.paymentTransferPrefix || ""} onChange={handleChange} className="w-full rounded-lg border border-gray-200 px-3 py-2" placeholder="KHOAHOC" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">QR chuyển khoản</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {formData.paymentQrUrl ? (
                  <img src={formData.paymentQrUrl} alt="QR preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">No QR</span>
                )}
              </div>
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  {qrUploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                  <span className="text-sm">{qrUploading ? "Đang upload..." : "Chọn ảnh QR"}</span>
                  <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleQrPick} />
                </label>
                <input
                  name="paymentQrUrl"
                  value={formData.paymentQrUrl || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-70"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {submitting ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
      </form>
    </div>
  );
};

export default SystemSettings;
