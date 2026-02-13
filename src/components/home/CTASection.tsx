import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic2 } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/50 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* For Clients */}
          <div className="card-gradient p-8 md:p-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              For Clients
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
              Find Your Perfect Voice
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Access Africa's top voice-over talent. Browse profiles, listen to demos, 
              and book instantly with our secure escrow payment system.
            </p>
            <Button variant="default" size="lg" asChild>
              <Link to="/artists" className="gap-2">
                Browse Artists
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* For Talent */}
          <div className="bg-gradient-to-br from-navy to-navy/90 rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-2xl" />
            
            <div className="relative">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
                For Voice Talent
              </span>
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
                Showcase Your Voice
              </h2>
              <p className="text-white/70 mb-6 leading-relaxed">
                Join Africa's premier voice marketplace. Create your profile, set your rates, 
                and connect with clients looking for authentic African voices.
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/register" className="gap-2">
                  <Mic2 className="w-4 h-4" />
                  Join as Talent
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
