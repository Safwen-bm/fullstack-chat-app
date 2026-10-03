import React from "react";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import ThemesSection from "../components/landing/ThemesSection";
import AboutSection from "../components/landing/AboutSection";
import FaqSection from "../components/landing/FaqSection";
import CtaFooter from "../components/landing/CtaFooter";

const HomePage = () => {
  return (
    <main className="bg-base-100 text-base-content overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <ThemesSection />
      <AboutSection />
      <FaqSection />
      <CtaFooter />
    </main>
  );
};

export default HomePage;