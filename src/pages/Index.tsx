import { useEffect } from "react";
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

const Index = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'client') {
        navigate('/client-dashboard');
      } else if (user.role === 'talent') {
        navigate('/talent-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

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
      <Footer />
    </div>
  );
};

export default Index;