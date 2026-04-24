import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Save, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import publicCmsService from "../../../services/publicCmsService";

const tabs = [
  { id: "home", label: "Trang chủ" },
  { id: "news", label: "Tin tức" },
  { id: "courseStore", label: "Khóa học" },
  { id: "teachers", label: "Giáo viên" },
  { id: "contact", label: "Liên hệ" },
];

const defaultCms = {
  home: {
    fontFamily: "inherit",
    pageBackgroundColor: "#FFFFFF",
    titleColor: "#0F172A",
    descriptionColor: "#475569",
    titleFontSize: "48px",
    descriptionFontSize: "18px",
    buttonColor: "#2563EB",
    buttonTextColor: "#FFFFFF",
    iconColor: "#2563EB",
    hero: {
      badgeText: "🏆 Trung tâm Cờ Vua hàng đầu",
      title: "Phát triển tư duy chiến lược cho thế hệ tương lai",
      highlightedText: "tư duy chiến lược",
      description:
        "Z Chess mang đến chương trình đào tạo cờ vua chất lượng cao, giúp trẻ em phát triển tư duy logic, khả năng tập trung và kỹ năng giải quyết vấn đề.",
      primaryButtonText: "Khám phá khóa học",
      primaryButtonLink: "/courses",
      secondaryButtonText: "Xem video giới thiệu",
      sectionBgColor: "#0F172A",
      titleColor: "#FFFFFF",
      descriptionColor: "#CBD5E1",
      titleFontSize: "56px",
    },
    courses: { title: "Khóa học nổi bật" },
    teachers: { title: "Đội ngũ giảng viên" },
    news: { title: "Tin tức mới nhất" },
    testimonials: { title: "Cảm nhận học viên" },
    contact: { title: "Liên hệ với chúng tôi" },
    cta: {},
  },
  courseStore: {
    title: "KHO KHÓA HỌC VIDEO",
    description:
      "Hệ thống bài giảng chất lượng cao, giúp bạn làm chủ bàn cờ từ Khai cuộc đến Tàn cuộc.",
    pageBackgroundColor: "#F9FAFB",
    titleColor: "#FFFFFF",
    descriptionColor: "#E2E8F0",
    titleFontSize: "48px",
    descriptionFontSize: "20px",
    fontFamily: "inherit",
    buttonColor: "#2563EB",
    buttonTextColor: "#FFFFFF",
    iconColor: "#2563EB",
  },
  courseDetail: {},
  teachersPage: {
    title: "Đội Ngũ Giảng Viên",
    description:
      "Gặp gỡ những Kiện tướng, Huấn luyện viên tâm huyết và giàu kinh nghiệm của chúng tôi.",
    pageBackgroundColor: "#FFFFFF",
    titleColor: "#111827",
    descriptionColor: "#4B5563",
    titleFontSize: "48px",
    descriptionFontSize: "20px",
    fontFamily: "inherit",
    buttonColor: "#2563EB",
    buttonTextColor: "#FFFFFF",
    iconColor: "#2563EB",
  },
  newsPage: {
    title: "Tin Tức & Sự Kiện",
    description:
      "Cập nhật những thông tin mới nhất về các giải đấu, hoạt động của câu lạc bộ và kiến thức cờ vua bổ ích.",
    pageBackgroundColor: "#FFFFFF",
    titleColor: "#111827",
    descriptionColor: "#4B5563",
    titleFontSize: "48px",
    descriptionFontSize: "20px",
    fontFamily: "inherit",
    buttonColor: "#2563EB",
    buttonTextColor: "#FFFFFF",
    iconColor: "#2563EB",
  },
  contactPage: {
    title: "Liên Hệ Với Chúng Tôi",
    description:
      "Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn về các khóa học cờ vua.",
    pageBackgroundColor: "#FFFFFF",
    titleColor: "#FFFFFF",
    descriptionColor: "#D1D5DB",
    titleFontSize: "48px",
    descriptionFontSize: "20px",
    fontFamily: "inherit",
    buttonColor: "#2563EB",
    buttonTextColor: "#FFFFFF",
    iconColor: "#2563EB",
  },
};

const deepMerge = (base, incoming) => {
  if (!incoming || typeof incoming !== "object") return base;
  const output = { ...base };
  Object.keys(incoming).forEach((key) => {
    const baseValue = output[key];
    const incomingValue = incoming[key];
    if (
      baseValue &&
      incomingValue &&
      typeof baseValue === "object" &&
      typeof incomingValue === "object" &&
      !Array.isArray(baseValue) &&
      !Array.isArray(incomingValue)
    ) {
      output[key] = deepMerge(baseValue, incomingValue);
    } else {
      output[key] = incomingValue;
    }
  });
  return output;
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

const Card = ({ title, subtitle, children }) => (
  <div className="border rounded-xl p-4 space-y-3 bg-white">
    <div>
      <div className="font-semibold text-gray-900">{title}</div>
      {subtitle ? <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div> : null}
    </div>
    {children}
  </div>
);

const PageStyleFields = ({ basePath, data, updateCms }) => (
  <div className="grid md:grid-cols-3 gap-3">
    <CInput
      label="Kiểu chữ"
      value={data?.fontFamily}
      onChange={(v) => updateCms(`${basePath}.fontFamily`, v)}
      placeholder="VD: Inter, Arial, sans-serif"
    />
    <CInput
      label="Cỡ chữ tiêu đề"
      value={data?.titleFontSize}
      onChange={(v) => updateCms(`${basePath}.titleFontSize`, v)}
      placeholder="VD: 48px"
    />
    <CInput
      label="Cỡ chữ mô tả"
      value={data?.descriptionFontSize}
      onChange={(v) => updateCms(`${basePath}.descriptionFontSize`, v)}
      placeholder="VD: 18px"
    />
    <ColorPicker
      label="Màu nền trang"
      value={data?.pageBackgroundColor}
      onChange={(v) => updateCms(`${basePath}.pageBackgroundColor`, v)}
    />
    <ColorPicker
      label="Màu tiêu đề"
      value={data?.titleColor}
      onChange={(v) => updateCms(`${basePath}.titleColor`, v)}
    />
    <ColorPicker
      label="Màu mô tả"
      value={data?.descriptionColor}
      onChange={(v) => updateCms(`${basePath}.descriptionColor`, v)}
    />
    <ColorPicker
      label="Màu nút"
      value={data?.buttonColor}
      onChange={(v) => updateCms(`${basePath}.buttonColor`, v)}
    />
    <ColorPicker
      label="Màu chữ nút"
      value={data?.buttonTextColor}
      onChange={(v) => updateCms(`${basePath}.buttonTextColor`, v)}
    />
    <ColorPicker
      label="Màu icon"
      value={data?.iconColor}
      onChange={(v) => updateCms(`${basePath}.iconColor`, v)}
    />
  </div>
);

const HeroSettingForm = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cms, setCms] = useState(defaultCms);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await publicCmsService.getAdmin();
        setCms((prev) => deepMerge(prev, data || {}));
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
    if (activeTab === "home") {
      return (
        <div className="space-y-5">
          <Card title="Hero trang chủ" subtitle="Nội dung + ảnh bìa + style chữ">
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
            <div className="grid md:grid-cols-3 gap-3">
              <ColorPicker label="Màu tiêu đề Hero" value={cms.home?.hero?.titleColor} onChange={(v) => updateCms("home.hero.titleColor", v)} />
              <ColorPicker label="Màu mô tả Hero" value={cms.home?.hero?.descriptionColor} onChange={(v) => updateCms("home.hero.descriptionColor", v)} />
              <CInput label="Cỡ chữ tiêu đề Hero" value={cms.home?.hero?.titleFontSize} onChange={(v) => updateCms("home.hero.titleFontSize", v)} placeholder="VD: 56px" />
            </div>
          </Card>
          <Card title="Style trang chủ" subtitle="Màu sắc, cỡ chữ, kiểu chữ, nút, icon cho riêng trang chủ">
            <PageStyleFields basePath="home" data={cms.home} updateCms={updateCms} />
          </Card>
          <Card title="Section trang chủ có thể chỉnh" subtitle="Tên section hiển thị ở trang chủ">
            <CInput label="Tiêu đề section Khóa học" value={cms.home?.courses?.title} onChange={(v) => updateCms("home.courses.title", v)} placeholder="Nhập tiêu đề section Khóa học" />
            <CInput label="Tiêu đề section Giáo viên" value={cms.home?.teachers?.title} onChange={(v) => updateCms("home.teachers.title", v)} placeholder="Nhập tiêu đề section Giáo viên" />
            <CInput label="Tiêu đề section Tin tức" value={cms.home?.news?.title} onChange={(v) => updateCms("home.news.title", v)} placeholder="Nhập tiêu đề section Tin tức" />
            <CInput label="Tiêu đề section Đánh giá" value={cms.home?.testimonials?.title} onChange={(v) => updateCms("home.testimonials.title", v)} placeholder="Nhập tiêu đề section Đánh giá" />
            <CInput label="Tiêu đề section Liên hệ" value={cms.home?.contact?.title} onChange={(v) => updateCms("home.contact.title", v)} placeholder="Nhập tiêu đề section Liên hệ" />
          </Card>
        </div>
      );
    }
    if (activeTab === "courseStore") {
      return (
        <Card title="Trang Khóa học" subtitle="Màu sắc, nội dung, cỡ chữ, ảnh bìa">
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
          <PageStyleFields basePath="courseStore" data={cms.courseStore} updateCms={updateCms} />
        </Card>
      );
    }
    if (activeTab === "teachers") {
      return (
        <Card title="Trang Giáo viên" subtitle="Màu sắc, nội dung, cỡ chữ, ảnh bìa">
          <CInput label="Tiêu đề trang Giáo viên" value={cms.teachersPage?.title} onChange={(v) => updateCms("teachersPage.title", v)} placeholder="Nhập tiêu đề trang giáo viên" />
          <label className="block">
            <div className="text-xs text-gray-600 mb-1">Mô tả trang Giáo viên</div>
            <textarea value={cms.teachersPage?.description || ""} onChange={(e) => updateCms("teachersPage.description", e.target.value)} className="w-full border rounded-lg px-3 py-2 min-h-[90px]" placeholder="Nhập mô tả trang giáo viên" />
          </label>
          <CInput label="Ảnh nền trang Giáo viên (URL)" value={cms.teachersPage?.heroBackground} onChange={(v) => updateCms("teachersPage.heroBackground", v)} placeholder="Dán URL ảnh nền trang giáo viên" />
          <PageStyleFields basePath="teachersPage" data={cms.teachersPage} updateCms={updateCms} />
        </Card>
      );
    }
    if (activeTab === "news") {
      return (
        <Card title="Trang Tin tức" subtitle="Màu sắc, nội dung, cỡ chữ, ảnh bìa">
          <CInput label="Tiêu đề trang Tin tức" value={cms.newsPage?.title} onChange={(v) => updateCms("newsPage.title", v)} placeholder="Nhập tiêu đề trang tin tức" />
          <label className="block">
            <div className="text-xs text-gray-600 mb-1">Mô tả trang Tin tức</div>
            <textarea value={cms.newsPage?.description || ""} onChange={(e) => updateCms("newsPage.description", e.target.value)} className="w-full border rounded-lg px-3 py-2 min-h-[90px]" placeholder="Nhập mô tả trang tin tức" />
          </label>
          <CInput label="Ảnh nền trang Tin tức (URL)" value={cms.newsPage?.heroBackground} onChange={(v) => updateCms("newsPage.heroBackground", v)} placeholder="Dán URL ảnh nền trang tin tức" />
          <PageStyleFields basePath="newsPage" data={cms.newsPage} updateCms={updateCms} />
        </Card>
      );
    }
    return (
      <Card title="Trang Liên hệ" subtitle="Màu sắc, nội dung, cỡ chữ, ảnh bìa">
        <CInput label="Tiêu đề trang Liên hệ" value={cms.contactPage?.title} onChange={(v) => updateCms("contactPage.title", v)} placeholder="Nhập tiêu đề trang liên hệ" />
        <label className="block">
          <div className="text-xs text-gray-600 mb-1">Mô tả trang Liên hệ</div>
          <textarea value={cms.contactPage?.description || ""} onChange={(e) => updateCms("contactPage.description", e.target.value)} className="w-full border rounded-lg px-3 py-2 min-h-[90px]" placeholder="Nhập mô tả trang liên hệ" />
        </label>
        <CInput label="Ảnh nền trang Liên hệ (URL)" value={cms.contactPage?.heroBackground} onChange={(v) => updateCms("contactPage.heroBackground", v)} placeholder="Dán URL ảnh nền trang liên hệ" />
        <PageStyleFields basePath="contactPage" data={cms.contactPage} updateCms={updateCms} />
      </Card>
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
        <h1 className="text-2xl font-bold text-gray-900">Public UI CMS Builder</h1>
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
