import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, Mic } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Decorative sound waves */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 sound-wave-bg" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Mic className="w-4 h-4" />
              <span className="text-sm font-medium">Africa's Premier Voice Marketplace</span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              <span className="gradient-brand-text">Africa Has</span>
              <br />
              <span className="gradient-brand-text">a Voice.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover powerful African voices for your next project. 
              From local accents to global excellence — hire verified 
              voice talents directly.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/artists">
                  <Play className="w-5 h-5" />
                  Find Talent
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/register">Join as Talent</Link>
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-10 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Trusted by leading brands across Africa</p>
              <div className="flex items-center gap-8 text-muted-foreground">
                <span className="font-heading font-bold text-foreground">MTN</span>
                <span className="font-heading font-bold text-foreground">Safaricom</span>
                <span className="font-heading font-bold text-foreground">Multichoice</span>
                <span className="font-heading font-bold text-foreground">UBA</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=500&fit=crop"
                    alt="African voice artist"
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-secondary to-primary p-6 shadow-lg">
                  <div className="text-white">
                    <div className="text-4xl font-heading font-bold">500+</div>
                    <div className="text-sm opacity-90">Voice artists</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-secondary p-6 shadow-lg">
                  <div className="text-white">
                    <div className="text-4xl font-heading font-bold">50+</div>
                    <div className="text-sm opacity-90">Languages</div>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop"
                    alt="African voice artist"
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-card rounded-xl px-6 py-3 shadow-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
                <span className="text-sm font-medium text-foreground">2,000+ languages & accents</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
