import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import teacherService from "../../../../services/teacherService";
import authService from "../../../../services/authService";

const emptyProfile = {
  fullName: "",
  phone: "",
  specialization: "",
  experienceYears: "",
  certificates: "",
  avatarUrl: "",
};

const TeacherSettings = () => {
  const fileInputRef = useRef(null);
  const [loadProfile, setLoadProfile] = useState(true);
  const [account, setAccount] = useState({ username: "", email: "" });
  const [profile, setProfile] = useState(emptyProfile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const persistUserFromProfile = useCallback((dto) => {
    const prev = authService.getCurrentUser();
    if (!prev) return;
    const next = {
      ...prev,
      fullName: dto.fullName ?? prev.fullName,
      phone: dto.phone ?? prev.phone,
      avatarUrl: dto.avatarUrl ?? prev.avatarUrl,
      email: dto.email ?? prev.email,
    };
    localStorage.setItem("user", JSON.stringify(next));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoadProfile(true);
        const data = await teacherService.getMyProfile();
        if (cancelled || !data) return;
        setAccount({
          username: data.username || "",
          email: data.email || "",
        });
        setProfile({
          fullName: data.fullName || "",
          phone: data.phone || "",
          specialization: data.specialization || "",
          experienceYears:
            data.experienceYears === null || data.experienceYears === undefined
              ? ""
              : String(data.experienceYears),
          certificates: data.certificates || "",
          avatarUrl: data.avatarUrl || "",
        });
      } catch (e) {
        toast.error(e?.response?.data?.message || "Không tải được hồ sơ");
      } finally {
        if (!cancelled) setLoadProfile(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const onAvatarPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const res = await teacherService.uploadAvatar(file);
      const url = res?.url || res?.data?.url;
      if (!url) {
        throw new Error("Thiếu URL ảnh từ server");
      }
      setProfile((p) => ({ ...p, avatarUrl: url }));
      toast.success("Tải ảnh lên thành công");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Upload ảnh thất bại");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    let experienceYears = null;
    if (profile.experienceYears !== "") {
      const n = Number(profile.experienceYears);
      if (Number.isNaN(n) || n < 0) {
        toast.error("Số năm kinh nghiệm không hợp lệ");
        return;
      }
      experienceYears = n;
    }
    try {
      setSavingProfile(true);
      const payload = {
        fullName: profile.fullName,
        phone: profile.phone,
        specialization: profile.specialization,
        certificates: profile.certificates,
        avatarUrl: profile.avatarUrl,
        experienceYears,
      };
      const updated = await teacherService.updateMyProfile(payload);
      setProfile({
        fullName: updated.fullName || "",
        phone: updated.phone || "",
        specialization: updated.specialization || "",
        experienceYears:
          updated.experienceYears === null || updated.experienceYears === undefined
            ? ""
            : String(updated.experienceYears),
        certificates: updated.certificates || "",
        avatarUrl: updated.avatarUrl || "",
      });
      setAccount({
        username: updated.username || account.username,
        email: updated.email || account.email,
      });
      persistUserFromProfile(updated);
      toast.success("Cập nhật thành công");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }
    if (pwd.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    try {
      setSavingPassword(true);
      await teacherService.changeMyPassword({
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      toast.success("Đổi mật khẩu thành công");
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = err?.response?.data?.message || "Đổi mật khẩu thất bại";
      if (msg === "Mật khẩu hiện tại không đúng") {
        toast.error("Mật khẩu hiện tại không đúng");
      } else {
        toast.error(msg);
      }
    } finally {
      setSavingPassword(false);
    }
  };

  if (loadProfile) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        Đang tải cài đặt...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt tài khoản</h1>
        <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin cá nhân và mật khẩu đăng nhập.</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h2>

        <form onSubmit={submitProfile} className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Chưa có ảnh
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
                onChange={onAvatarPick}
              />
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow border-2 border-white hover:bg-indigo-700 disabled:opacity-60"
                aria-label="Đổi ảnh đại diện"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
                  <input
                    type="text"
                    readOnly
                    value={account.username}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    readOnly
                    value={account.email}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(ev) => setProfile((p) => ({ ...p, fullName: ev.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(ev) => setProfile((p) => ({ ...p, phone: ev.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên môn</label>
                <input
                  type="text"
                  value={profile.specialization}
                  onChange={(ev) => setProfile((p) => ({ ...p, specialization: ev.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm (năm)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={profile.experienceYears}
                  onChange={(ev) => setProfile((p) => ({ ...p, experienceYears: ev.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Để trống nếu không áp dụng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chứng chỉ</label>
                <textarea
                  rows={3}
                  value={profile.certificates}
                  onChange={(ev) => setProfile((p) => ({ ...p, certificates: ev.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
            >
              {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              Cập nhật thông tin
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h2>
        <form onSubmit={submitPassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              autoComplete="current-password"
              value={pwd.currentPassword}
              onChange={(ev) => setPwd((p) => ({ ...p, currentPassword: ev.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              autoComplete="new-password"
              value={pwd.newPassword}
              onChange={(ev) => setPwd((p) => ({ ...p, newPassword: ev.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              autoComplete="new-password"
              value={pwd.confirmPassword}
              onChange={(ev) => setPwd((p) => ({ ...p, confirmPassword: ev.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-gray-800 disabled:opacity-60"
            >
              {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default TeacherSettings;
