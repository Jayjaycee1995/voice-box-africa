import { Link } from "react-router-dom";
import voiboxLogo from "@/assets/voibox-logo.png";

const Footer = () => {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={voiboxLogo} 
              alt="VOICEBOX Africa" 
              className="h-8 w-auto" 
            />
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-white/50">
            <p>© 2015 - {new Date().getFullYear()} VOICEBOX Africa™</p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <Link to="/terms" className="hover:text-secondary transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy</Link>
              <Link to="/contact" className="hover:text-secondary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
