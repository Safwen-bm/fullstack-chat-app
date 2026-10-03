import React from "react";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import ThemesSection from "../components/landing/ThemesSection";
import AboutSection from "../components/landing/AboutSection";
import FaqSection from "../components/landing/FaqSection";
import CtaSection from "../components/landing/CtaSection";
import Footer from "../components/landing/Footer";

const HomePage = () => {
  return (
    <>
      <main className="bg-base-100 text-base-content overflow-x-hidden">
        <HeroSection />
        <FeaturesSection />
        <ThemesSection />
        <AboutSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;