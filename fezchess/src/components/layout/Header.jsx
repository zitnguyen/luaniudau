import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSystemSettings } from "../../context/SystemSettingsContext";
import ThemeToggle from "../common/ThemeToggle";

const navLinks = [
  { name: "Trang chủ", path: "/" },
  { name: "Khóa học", path: "/courses" },
  { name: "Giáo viên", path: "/teachers" },
  { name: "Tin tức", path: "/news" },
  { name: "Liên hệ", path: "/contact" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSystemSettings();

  const handleGoHome = () => {
    navigate("/");
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <button onClick={handleGoHome} className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <motion.img
                whileHover={{ rotate: 8 }}
                transition={{ duration: 0.3 }}
                src={settings.logoUrl}
                alt="Center logo"
                className="w-12 h-12 rounded-xl object-cover border border-border"
              />
            ) : (
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ duration: 0.3 }}
                className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center"
              >
                <span className="text-2xl">♔</span>
              </motion.div>
            )}
            <div className="text-left">
              <h1 className="font-display text-xl font-bold">
                {settings?.centerName || "Z Chess"}
              </h1>
              <p className="text-xs text-muted-foreground">Trung tâm Cờ Vua</p>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-2 font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-primary"
                    : "hover:text-primary"
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login" className="font-medium hover:text-primary">
              Đăng nhập
            </Link>
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg"
              >
                Đăng ký
              </motion.button>
            </Link>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-muted"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block py-3 px-4 rounded-xl font-medium ${
                      location.pathname === link.path
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
