import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import FounderSection from "@/components/sections/FounderSection";
import CoursesSection from "@/components/sections/CoursesSection";
import FacultySection from "@/components/sections/FacultySection";
import WhyUsSection from "@/components/sections/WhyUsSection";
import ResultsSection from "@/components/sections/ResultsSection";
import YoutubeSection from "@/components/sections/YoutubeSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import AdmissionSection from "@/components/sections/AdmissionSection";
import FaqSection from "@/components/sections/FaqSection";
import ContactSection from "@/components/sections/ContactSection";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <FounderSection />
        <CoursesSection />
        <FacultySection />
        <WhyUsSection />
        <ResultsSection />
        <YoutubeSection />
        <TestimonialsSection />
        <AdmissionSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
