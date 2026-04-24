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
           { path: "home.hero.primaryButtonText", label: "Tên nút chính" },
           { path: "home.hero.primaryButtonBgColor", label: "Màu nút", type: "color" },
           { path: "home.buttonColor", label: "Màu nút (section)", type: "color" },
           { path: "home.hero.primaryButtonTextColor", label: "Màu chữ nút", type: "color" },
           { path: "home.buttonTextColor", label: "Màu chữ nút (section)", type: "color" },
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
