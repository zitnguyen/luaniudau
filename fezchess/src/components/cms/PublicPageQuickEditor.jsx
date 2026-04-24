import React, { useMemo, useState } from "react";
import { Settings, X, Save } from "lucide-react";
import authService from "../../services/authService";
import publicCmsService from "../../services/publicCmsService";
import { usePublicCms } from "../../context/PublicCmsContext";

const getByPath = (obj, path) =>
  String(path || "")
    .split(".")
    .filter(Boolean)
    .reduce((acc, key) => (acc && typeof acc === "object" ? acc[key] : undefined), obj);

const setByPath = (obj, path, value) => {
  const keys = String(path || "").split(".").filter(Boolean);
  if (!keys.length) return;
  let cursor = obj;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    cursor[key] = cursor[key] && typeof cursor[key] === "object" ? { ...cursor[key] } : {};
    cursor = cursor[key];
  }
  cursor[keys[keys.length - 1]] = value;
};

const PublicPageQuickEditor = ({ title = "Chỉnh sửa nhanh", fields = [] }) => {
  const user = authService.getCurrentUser();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const { cms, refreshCms, setCmsOptimistic } = usePublicCms();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({});

  const hydratedFields = useMemo(
    () =>
      fields.map((field) => ({
        ...field,
        value:
          form[field.path] !== undefined
            ? form[field.path]
            : getByPath(cms, field.path) ?? "",
      })),
    [fields, form, cms],
  );

  if (!isAdmin) return null;

  const handleChange = (path, value) => {
    setForm((prev) => ({ ...prev, [path]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      const nextCms = JSON.parse(JSON.stringify(cms || {}));
      fields.forEach((field) => {
        const nextValue =
          form[field.path] !== undefined ? form[field.path] : getByPath(cms, field.path) ?? "";
        setByPath(nextCms, field.path, nextValue);
      });
      const saved = await publicCmsService.update(nextCms);
      // Apply immediately on current page so user sees instant change.
      if (saved && typeof saved === "object") {
        setCmsOptimistic((prev) => ({ ...prev, ...saved }));
      }
      await refreshCms();
      setMessage("Đã lưu thay đổi.");
      setForm({});
    } catch (error) {
      setMessage(error?.response?.data?.message || "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed right-4 bottom-4 z-[80]">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full shadow-lg"
        >
          <Settings size={16} />
          Sửa giao diện trang
        </button>
      ) : (
        <div className="w-[360px] max-w-[92vw] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="font-semibold text-gray-900 text-sm">{title}</div>
            <button type="button" onClick={() => setOpen(false)} className="text-gray-500">
              <X size={16} />
            </button>
          </div>
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
            {hydratedFields.map((field) => (
              <label key={field.path} className="block">
                <div className="text-xs text-gray-600 mb-1">{field.label}</div>
                {field.type === "textarea" ? (
                  <textarea
                    value={field.value}
                    onChange={(e) => handleChange(field.path, e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 min-h-[90px]"
                    placeholder={field.placeholder || ""}
                  />
                ) : field.type === "color" ? (
                  <div className="flex items-center gap-2 border rounded-lg px-2 py-2">
                    <input
                      type="color"
                      value={field.value || "#2563EB"}
                      onChange={(e) => handleChange(field.path, e.target.value)}
                      className="h-9 w-12 p-0 border-0 bg-transparent"
                    />
                    <span className="font-mono text-sm">{field.value || "#2563EB"}</span>
                  </div>
                ) : (
                  <input
                    value={field.value}
                    onChange={(e) => handleChange(field.path, e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder={field.placeholder || ""}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            {message ? <div className="text-xs text-gray-600 mb-2">{message}</div> : null}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-70"
            >
              <Save size={14} />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicPageQuickEditor;
