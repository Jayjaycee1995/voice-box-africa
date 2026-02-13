import { Link } from "react-router-dom";
import { Twitter, Instagram, Linkedin, Facebook, Youtube } from "lucide-react";
import voiboxLogo from "@/assets/voibox-logo.png";

const footerLinks = {
  forClients: {
    title: "For Clients",
    links: [
      { label: "How to Hire", to: "/how-it-works" },
      { label: "Talent Marketplace", to: "/artists" },
      { label: "Enterprise", to: "/enterprise" },
      { label: "Pricing", to: "/pricing" },
      { label: "Contract-to-Hire", to: "/contract" },
      { label: "Direct Contracts", to: "/contracts" },
    ],
  },
  forTalent: {
    title: "For Talent",
    links: [
      { label: "How to Find Work", to: "/how-it-works" },
      { label: "Direct Contracts", to: "/contracts" },
      { label: "Find Jobs", to: "/jobs" },
      { label: "Resources", to: "/resources" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Help & Support", to: "/support" },
      { label: "Success Stories", to: "/stories" },
      { label: "VoiceBox Reviews", to: "/reviews" },
      { label: "Blog", to: "/blog" },
      { label: "Community", to: "/community" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Leadership", to: "/leadership" },
      { label: "Investor Relations", to: "/investors" },
      { label: "Careers", to: "/careers" },
      { label: "Contact Us", to: "/contact" },
      { label: "Trust, Safety & Security", to: "/trust" },
    ],
  },
};

const Footer = () => {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Top accent line */}
        <div className="accent-line w-24 mb-12" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-heading text-sm font-semibold text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/60 hover:text-secondary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src={voiboxLogo} 
                alt="VOICEBOX Africa" 
                className="h-8 w-auto transition-all duration-300 hover:scale-105" 
              />
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/50 mr-2">Follow us</span>
              <a href="#" className="text-white/50 hover:text-secondary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/50 hover:text-secondary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/50 hover:text-secondary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/50 hover:text-secondary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/50 hover:text-secondary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Brand Message */}
          <div className="mt-6 text-center md:text-left">
            <p className="text-lg font-heading font-bold gradient-brand-text">
              Africa Has a Voice.
            </p>
          </div>

          {/* Copyright */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>© 2015 - {new Date().getFullYear()} VOICEBOX Africa™</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
              <Link to="/accessibility" className="hover:text-secondary transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
