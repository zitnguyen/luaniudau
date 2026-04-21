import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Save, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import publicCmsService from "../../../services/publicCmsService";

const tabs = [
  { id: "theme", label: "Theme Global" },
  { id: "home", label: "Trang chủ" },
  { id: "testimonials", label: "Đánh giá (CMS)" },
  { id: "courseStore", label: "Khóa học" },
  { id: "teachers", label: "Giáo viên" },
  { id: "news", label: "Tin tức" },
  { id: "contact", label: "Liên hệ" },
];

const defaultCms = {
  theme: {
    fontFamily: "inherit",
    primaryColor: "#2563EB",
    secondaryColor: "#0F172A",
    accentColor: "#CA8A04",
    textColor: "#0F172A",
    mutedTextColor: "#64748B",
    buttonRadius: "12px",
  },
  home: {
    hero: {},
    courses: {},
    teachers: {},
    news: {},
    testimonials: {},
    contact: {},
    cta: {},
  },
  courseStore: {},
  courseDetail: {},
  teachersPage: {},
  newsPage: {},
  contactPage: {},
};

const CInput = ({ label, value, onChange, placeholder }) => (
  <label className="block">
    {label ? <div className="text-xs text-gray-600 mb-1">{label}</div> : null}
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border rounded-lg px-3 py-2"
    />
  </label>
);

const ColorPicker = ({ label, value, onChange }) => (
  <label className="block">
    <div className="text-xs text-gray-600 mb-1">{label}</div>
    <div className="flex items-center gap-2 border rounded-lg px-2 py-2">
      <input
        type="color"
        value={value || "#2563EB"}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 p-0 border-0 bg-transparent"
      />
      <span className="font-mono text-sm">{value || "#2563EB"}</span>
    </div>
  </label>
);

const HeroSettingForm = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("theme");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cms, setCms] = useState(defaultCms);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await publicCmsService.getAdmin();
        setCms((prev) => ({ ...prev, ...data }));
      } catch (error) {
        alert(error?.response?.data?.message || "Không tải được Public CMS");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const updateCms = (path, value) => {
    setCms((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let cursor = next;
      for (let i = 0; i < keys.length - 1; i += 1) {
        const key = keys[i];
        cursor[key] = { ...(cursor[key] || {}) };
        cursor = cursor[key];
      }
      cursor[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    try {
      setSaving(true);
      await publicCmsService.update(cms);
      alert("Đã lưu Public CMS.");
    } catch (error) {
      alert(error?.response?.data?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (path, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await publicCmsService.uploadMedia(file);
      if (url) updateCms(path, url);
    } catch (error) {
      alert(error?.response?.data?.message || "Upload thất bại");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const tabContent = useMemo(() => {
    if (activeTab === "theme") {
      return (
        <div className="space-y-4">
          <CInput label="Phông chữ toàn site" value={cms.theme?.fontFamily} onChange={(v) => updateCms("theme.fontFamily", v)} placeholder="VD: Inter, Arial, sans-serif" />
          <div className="grid md:grid-cols-3 gap-4">
            <ColorPicker label="Primary" value={cms.theme?.primaryColor} onChange={(v) => updateCms("theme.primaryColor", v)} />
            <ColorPicker label="Secondary" value={cms.theme?.secondaryColor} onChange={(v) => updateCms("theme.secondaryColor", v)} />
            <ColorPicker label="Accent" value={cms.theme?.accentColor} onChange={(v) => updateCms("theme.accentColor", v)} />
            <ColorPicker label="Text" value={cms.theme?.textColor} onChange={(v) => updateCms("theme.textColor", v)} />
            <ColorPicker label="Muted text" value={cms.theme?.mutedTextColor} onChange={(v) => updateCms("theme.mutedTextColor", v)} />
          </div>
          <CInput label="Bo góc nút (button radius)" value={cms.theme?.buttonRadius} onChange={(v) => updateCms("theme.buttonRadius", v)} placeholder="VD: 12px" />
        </div>
      );
    }
    if (activeTab === "home") {
      return (
        <div className="space-y-5">
          <div className="border rounded-xl p-4 space-y-3">
            <div className="font-semibold">Hero</div>
            <CInput label="Nhãn nhỏ (Badge)" value={cms.home?.hero?.badgeText} onChange={(v) => updateCms("home.hero.badgeText", v)} placeholder="VD: Trung tâm Cờ Vua hàng đầu" />
            <CInput label="Tiêu đề Hero" value={cms.home?.hero?.title} onChange={(v) => updateCms("home.hero.title", v)} placeholder="Nhập tiêu đề lớn của Hero" />
            <CInput label="Từ/cụm từ highlight trong tiêu đề" value={cms.home?.hero?.highlightedText} onChange={(v) => updateCms("home.hero.highlightedText", v)} placeholder="VD: tư duy chiến lược" />
            <label className="block">
              <div className="text-xs text-gray-600 mb-1">Mô tả Hero</div>
              <textarea value={cms.home?.hero?.description || ""} onChange={(e) => updateCms("home.hero.description", e.target.value)} className="w-full border rounded-lg px-3 py-2 min-h-[90px]" placeholder="Mô tả ngắn dưới tiêu đề Hero" />
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              <CInput label="Tên nút chính" value={cms.home?.hero?.primaryButtonText} onChange={(v) => updateCms("home.hero.primaryButtonText", v)} placeholder="VD: Khám phá khóa học" />
              <CInput label="Link nút chính" value={cms.home?.hero?.primaryButtonLink} onChange={(v) => updateCms("home.hero.primaryButtonLink", v)} placeholder="VD: /courses" />
              <CInput label="Tên nút phụ" value={cms.home?.hero?.secondaryButtonText} onChange={(v) => updateCms("home.hero.secondaryButtonText", v)} placeholder="VD: Xem video giới thiệu" />
              <CInput label="Link nút phụ" value={cms.home?.hero?.secondaryButtonLink} onChange={(v) => updateCms("home.hero.secondaryButtonLink", v)} placeholder="VD: https://..." />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <CInput label="Ảnh/Video Hero (URL)" value={cms.home?.hero?.mediaUrl} onChange={(v) => updateCms("home.hero.mediaUrl", v)} placeholder="Dán URL media Hero" />
              <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer h-fit">
                {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                Upload ảnh/video Hero
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => handleUpload("home.hero.mediaUrl", e)} />
              </label>
            </div>
          </div>
          <div className="border rounded-xl p-4 space-y-2">
            <div className="font-semibold">Tiêu đề các section trang chủ</div>
            <CInput label="Tiêu đề section Khóa học" value={cms.home?.courses?.title} onChange={(v) => updateCms("home.courses.title", v)} placeholder="Nhập tiêu đề section Khóa học" />
            <CInput label="Tiêu đề section Giáo viên" value={cms.home?.teachers?.title} onChange={(v) => updateCms("home.teachers.title", v)} placeholder="Nhập tiêu đề section Giáo viên" />
            <CInput label="Tiêu đề section Tin tức" value={cms.home?.news?.title} onChange={(v) => updateCms("home.news.title", v)} placeholder="Nhập tiêu đề section Tin tức" />
            <CInput label="Tiêu đề section Đánh giá" value={cms.home?.testimonials?.title} onChange={(v) => updateCms("home.testimonials.title", v)} placeholder="Nhập tiêu đề section Đánh giá" />
            <CInput label="Tiêu đề section Liên hệ" value={cms.home?.contact?.title} onChange={(v) => updateCms("home.contact.title", v)} placeholder="Nhập tiêu đề section Liên hệ" />
          </div>
        </div>
      );
    }
    if (activeTab === "courseStore") {
      return (
        <div className="space-y-3">
            <CInput label="Tiêu đề trang Khóa học" value={cms.courseStore?.title} onChange={(v) => updateCms("courseStore.title", v)} placeholder="Nhập tiêu đề đầu trang khóa học" />
          <label className="block">
            <div className="text-xs text-gray-600 mb-1">Mô tả trang Khóa học</div>
            <textarea value={cms.courseStore?.description || ""} onChange={(e) => updateCms("courseStore.description", e.target.value)} className="w-full border rounded-lg px-3 py-2 min-h-[90px]" placeholder="Nhập mô tả trang khóa học" />
          </label>
          <CInput label="Ảnh nền trang Khóa học (URL)" value={cms.courseStore?.heroBackground} onChange={(v) => updateCms("courseStore.heroBackground", v)} placeholder="Dán URL ảnh nền trang khóa học" />
          <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer">
            {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
            Upload ảnh nền
            <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => handleUpload("courseStore.heroBackground", e)} />
          </label>
        </div>
      );
    }
    if (activeTab === "testimonials") {
      return (
        <div className="space-y-5">
          <div className="border rounded-xl p-4 space-y-3">
            <div className="font-semibold">Nội dung section đánh giá ở trang chủ</div>
            <CInput label="Badge section Đánh giá" value={cms.home?.testimonials?.badge} onChange={(v) => updateCms("home.testimonials.badge", v)} placeholder="VD: Phản hồi" />
            <CInput label="Tiêu đề section Đánh giá" value={cms.home?.testimonials?.title} onChange={(v) => updateCms("home.testimonials.title", v)} placeholder="Nhập tiêu đề section đánh giá" />
            <label className="block">
              <div className="text-xs text-gray-600 mb-1">Mô tả section Đánh giá</div>
              <textarea
                value={cms.home?.testimonials?.description || ""}
                onChange={(e) => updateCms("home.testimonials.description", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 min-h-[90px]"
                placeholder="Nhập mô tả section đánh giá"
              />
            </label>
          </div>
          <div className="border rounded-xl p-4 space-y-3">
            <div className="text-sm text-gray-600">
              CRUD danh sách đánh giá (thêm/sửa/xóa từng testimonial) vẫn dùng màn quản lý testimonial hiện có.
            </div>
            <button
              type="button"
              onClick={() => navigate("/cms/testimonials")}
              className="px-4 py-2 rounded-lg bg-primary text-white"
            >
              Mở danh sách testimonial
            </button>
          </div>
        </div>
      );
    }
    if (activeTab === "teachers") {
      return (
        <div className="space-y-3">
          <CInput label="Tiêu đề trang Giáo viên" value={cms.teachersPage?.title} onChange={(v) => updateCms("teachersPage.title", v)} placeholder="Nhập tiêu đề trang giáo viên" />
          <label className="block">
            <div className="text-xs text-gray-600 mb-1">Mô tả trang Giáo viên</div>
            <textarea value={cms.teachersPage?.description || ""} onChange={(e) => updateCms("teachersPage.description", e.target.value)} className="w-full border rounded-lg px-3 py-2 min-h-[90px]" placeholder="Nhập mô tả trang giáo viên" />
          </label>
          <CInput label="Ảnh nền trang Giáo viên (URL)" value={cms.teachersPage?.heroBackground} onChange={(v) => updateCms("teachersPage.heroBackground", v)} placeholder="Dán URL ảnh nền trang giáo viên" />
        </div>
      );
    }
    if (activeTab === "news") {
      return (
        <div className="space-y-3">
          <CInput label="Tiêu đề trang Tin tức" value={cms.newsPage?.title} onChange={(v) => updateCms("newsPage.title", v)} placeholder="Nhập tiêu đề trang tin tức" />
          <label className="block">
            <div className="text-xs text-gray-600 mb-1">Mô tả trang Tin tức</div>
            <textarea value={cms.newsPage?.description || ""} onChange={(e) => updateCms("newsPage.description", e.target.value)} className="w-full border rounded-lg px-3 py-2 min-h-[90px]" placeholder="Nhập mô tả trang tin tức" />
          </label>
          <CInput label="Ảnh nền trang Tin tức (URL)" value={cms.newsPage?.heroBackground} onChange={(v) => updateCms("newsPage.heroBackground", v)} placeholder="Dán URL ảnh nền trang tin tức" />
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <CInput label="Tiêu đề trang Liên hệ" value={cms.contactPage?.title} onChange={(v) => updateCms("contactPage.title", v)} placeholder="Nhập tiêu đề trang liên hệ" />
        <label className="block">
          <div className="text-xs text-gray-600 mb-1">Mô tả trang Liên hệ</div>
          <textarea value={cms.contactPage?.description || ""} onChange={(e) => updateCms("contactPage.description", e.target.value)} className="w-full border rounded-lg px-3 py-2 min-h-[90px]" placeholder="Nhập mô tả trang liên hệ" />
        </label>
        <CInput label="Ảnh nền trang Liên hệ (URL)" value={cms.contactPage?.heroBackground} onChange={(v) => updateCms("contactPage.heroBackground", v)} placeholder="Dán URL ảnh nền trang liên hệ" />
      </div>
    );
  }, [activeTab, cms, uploading]);

  if (fetching) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-600">
        <Loader2 className="animate-spin" size={18} />
        Đang tải Public CMS...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft size={16} />
        Quay lại dashboard
      </button>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Public CMS Builder</h1>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-70">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="border-b p-2 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm ${activeTab === tab.id ? "bg-primary text-white" : "bg-gray-100 text-gray-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4">{tabContent}</div>
      </div>
    </div>
  );
};

export default HeroSettingForm;
