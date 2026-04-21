import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useSystemSettings } from "../../context/SystemSettingsContext";

const Footer = () => {
  const { settings } = useSystemSettings();

  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Center logo"
                  className="w-12 h-12 rounded-xl object-cover border border-border"
                />
              ) : (
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-2xl">♔</span>
                </div>
              )}
              <div>
                <h3 className="font-display text-xl font-bold">
                  {settings?.centerName || "Z Chess"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Trung tâm Cờ Vua
                </p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Nơi phát triển tư duy, bản lĩnh cho thế hệ trẻ.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">
              Liên kết nhanh
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Trang chủ", to: "/" },
                { label: "Khóa học", to: "/courses" },
                { label: "Giáo viên", to: "/teachers" },
                { label: "Liên hệ", to: "/contact" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">
              Liên hệ
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground">
                <PhoneIcon className="w-5 h-5 text-primary" />
                <span>{settings?.hotline || "0934 830 045"}</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <EnvelopeIcon className="w-5 h-5 text-primary" />
                <span>{settings?.email || "zchessvn@gmail.com"}</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPinIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  {settings?.address ||
                    "1181/26 KDC Lê Văn Lương, xã Nhà Bè, TP. Hồ Chí Minh"}
                </span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <span className="w-5 h-5 text-primary font-bold">⏰</span>
                <span>{settings?.workingHours || "08:00 - 20:00"}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">
              Đăng ký nhận tin
            </h4>
            <p className="text-muted-foreground mb-4">
              Nhận thông tin khóa học mới và ưu đãi đặc biệt
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email của bạn"
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="bg-primary text-primary-foreground w-full py-2 rounded-lg font-medium"
              >
                Đăng ký
              </motion.button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 Z Chess. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Chính sách bảo mật
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Điều khoản sử dụng
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
