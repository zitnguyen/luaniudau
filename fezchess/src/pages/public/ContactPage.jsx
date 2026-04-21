import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { useSystemSettings } from "../../context/SystemSettingsContext";
import { usePublicCms } from "../../context/PublicCmsContext";

const ContactPage = () => {
  const { settings } = useSystemSettings();
  const { cms } = usePublicCms();
  const page = cms?.contactPage || {};
  const mapLink = "https://maps.app.goo.gl/bbvA86VXqt63hG9a7";
  const mapQueryAddress =
    settings?.address || "1181/26 KDC Lê Văn Lương, Xã Nhà Bè, TP. Hồ Chí Minh";
  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    mapQueryAddress,
  )}&output=embed`;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    type: "General",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post("/inquiries", formData);
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        type: "General",
      });
    } catch (error) {
      console.error("Error sending inquiry:", error);
      alert("Gửi liên hệ thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div
        className="text-white py-20"
        style={{
          backgroundColor: page?.heroBackground ? undefined : "#111827",
          backgroundImage: page?.heroBackground ? `url(${page.heroBackground})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{page?.title || "Liên Hệ Với Chúng Tôi"}</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {page?.description ||
              "Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn về các khóa học cờ vua."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Thông Tin Liên Lạc
            </h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Địa chỉ
                  </h3>
                  <p className="text-gray-600">
                    {settings?.address || "1181/26, KDC Lê Văn Lương, Xã Nhà Bè, TP. Hồ Chí Minh"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Điện thoại
                  </h3>
                  <p className="text-gray-600">{settings?.hotline || "0934 830 045"}</p>
                  <p className="text-gray-500 text-sm mt-1">Hỗ trợ 24/7</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Email
                  </h3>
                  <p className="text-gray-600">{settings?.email || "zchessvn@gmail.com"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Giờ làm việc
                  </h3>
                  <p className="text-gray-600">{settings?.workingHours || "Thứ 2 - Chủ Nhật: 8:00 - 21:00"}</p>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="mt-10 rounded-xl overflow-hidden border border-gray-200">
              <div className="relative">
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 text-primary hover:text-primary/90 hover:bg-white font-semibold text-sm transition-colors"
                >
                  Open in Maps
                </a>
              <iframe
                title="Google Maps"
                src={mapEmbedSrc}
                width="100%"
                height="320"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              </div>
              <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-sm">
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Open in Maps
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Gửi Tin Nhắn Cho Trung Tâm
            </h2>

            {success ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Đã gửi thành công!
                </h3>
                <p className="text-gray-600 mb-6">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại nhu cầu
                  </label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="General">Tư vấn chung</option>
                    <option value="Trial">Đăng ký học thử</option>
                    <option value="Consultation">
                      Tư vấn khóa học chuyên sâu
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lời nhắn
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary h-32"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Bạn cần hỗ trợ gì thêm không?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                >
                  {loading ? (
                    "Đang gửi..."
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Gửi Tin Nhắn
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
