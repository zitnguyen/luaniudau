import React from 'react';
import HeroSection from "../../components/sections/HeroSection";
import CoursesSection from "../../components/sections/CoursesSection";
import TeachersSection from "../../components/sections/TeachersSection";
import TestimonialSection from "../../components/sections/TestimonialSection";
import CTASection from "../../components/sections/CTASection";
import ContactSection from "../../components/sections/ContactSection";
import PageTransition from "../../components/layout/PageTransition";
import NewsSection from "../../components/sections/NewsSection";
import PublicPageQuickEditor from "../../components/cms/PublicPageQuickEditor";
import { usePublicCms } from "../../context/PublicCmsContext";

const HomePage = () => {
  const { cms } = usePublicCms();
  const home = cms?.home || {};

  return (
    <PageTransition>
      <div
        style={{
          backgroundColor: home?.pageBackgroundColor || undefined,
          fontFamily:
            home?.fontFamily && home.fontFamily !== "inherit" ? home.fontFamily : undefined,
        }}
      >
       <HeroSection />
       <CoursesSection />
       <TeachersSection />
       <TestimonialSection />
       <NewsSection />
       <CTASection />
       <ContactSection />
      </div>
       <PublicPageQuickEditor
         title="Chỉnh giao diện Trang chủ"
         fields={[
           { path: "home.hero.title", label: "Tiêu đề Hero" },
           { path: "home.hero.description", label: "Mô tả Hero", type: "textarea" },
           { path: "home.hero.primaryButtonText", label: "Hero - Tên nút chính" },
           { path: "home.hero.primaryButtonBgColor", label: "Hero - Màu nền nút chính", type: "color" },
           { path: "home.hero.primaryButtonTextColor", label: "Hero - Màu chữ nút chính", type: "color" },
           { path: "home.hero.secondaryButtonText", label: "Hero - Tên nút phụ" },
           { path: "home.hero.secondaryButtonTextColor", label: "Hero - Màu chữ nút phụ", type: "color" },
           { path: "home.hero.secondaryButtonBorderColor", label: "Hero - Màu viền nút phụ", type: "color" },
           { path: "home.courses.buttonText", label: "Khóa học - Nút xem tất cả" },
           { path: "home.courses.buttonBgColor", label: "Khóa học - Màu nền nút xem tất cả", type: "color" },
           { path: "home.courses.buttonTextColor", label: "Khóa học - Màu chữ nút xem tất cả", type: "color" },
           { path: "home.courses.cardButtonText", label: "Card khóa học - Nút xem chi tiết" },
           { path: "home.courses.cardButtonBgColor", label: "Card khóa học - Màu nền nút", type: "color" },
           { path: "home.courses.cardButtonTextColor", label: "Card khóa học - Màu chữ nút", type: "color" },
           { path: "home.news.buttonText", label: "Tin tức - Nút desktop" },
           { path: "home.news.mobileButtonText", label: "Tin tức - Nút mobile" },
           { path: "home.news.buttonBgColor", label: "Tin tức - Màu nền nút mobile", type: "color" },
           { path: "home.news.buttonTextColor", label: "Tin tức - Màu chữ nút xem tất cả", type: "color" },
           { path: "home.news.cardButtonText", label: "Card tin tức - Nút đọc thêm" },
           { path: "home.news.cardButtonTextColor", label: "Card tin tức - Màu chữ nút", type: "color" },
           { path: "home.cta.primaryButtonText", label: "CTA - Nút chính" },
           { path: "home.cta.primaryButtonBgColor", label: "CTA - Màu nền nút chính", type: "color" },
           { path: "home.cta.primaryButtonTextColor", label: "CTA - Màu chữ nút chính", type: "color" },
           { path: "home.cta.secondaryButtonText", label: "CTA - Nút phụ" },
           { path: "home.cta.secondaryButtonTextColor", label: "CTA - Màu chữ nút phụ", type: "color" },
           { path: "home.cta.secondaryButtonBorderColor", label: "CTA - Màu viền nút phụ", type: "color" },
           { path: "home.contact.submitButtonText", label: "Liên hệ - Nút gửi form" },
           { path: "home.contact.submitButtonBgColor", label: "Liên hệ - Màu nền nút gửi", type: "color" },
           { path: "home.contact.submitButtonTextColor", label: "Liên hệ - Màu chữ nút gửi", type: "color" },
           { path: "home.hero.titleColor", label: "Màu tiêu đề Hero", type: "color" },
           { path: "home.hero.descriptionColor", label: "Màu mô tả Hero", type: "color" },
           { path: "home.pageBackgroundColor", label: "Màu nền trang", type: "color" },
           { path: "home.iconColor", label: "Màu icon", type: "color" },
         ]}
       />
    </PageTransition>
  );
};

export default HomePage;
