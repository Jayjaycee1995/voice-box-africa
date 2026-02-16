import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import BrowseByCategory from "@/components/home/BrowseByCategory";
import EnterpriseSection from "@/components/home/EnterpriseSection";
import FindTalentSection from "@/components/home/FindTalentSection";
import WhyVoiceBoxSection from "@/components/home/WhyVoiceBoxSection";
import ForTalentSection from "@/components/home/ForTalentSection";
import TrustedBrandsSection from "@/components/home/TrustedBrandsSection";
import CTASection from "@/components/home/CTASection";
import SkillsSection from "@/components/home/SkillsSection";
import { ArrowUp } from "lucide-react";

const Index = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'client') {
        navigate('/client-dashboard');
      } else if (user.role === 'talent') {
        navigate('/talent-dashboard');
      } else {
        navigate('/admin');
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <BrowseByCategory />
        <EnterpriseSection />
        <FindTalentSection />
        <WhyVoiceBoxSection />
        <ForTalentSection />
        <TrustedBrandsSection />
        <CTASection />
        <SkillsSection />
      </main>
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full border border-border bg-background/80 backdrop-blur-lg shadow-lg transition-all hover:shadow-xl hover:bg-background active:scale-95"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 mx-auto text-foreground" />
        </button>
      )}
      <Footer />
    </div>
  );
};

export default Index;
