import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, Building2 } from "lucide-react";
import { useScrollAnimation, useStaggerAnimation } from "@/hooks/use-scroll-animation";

const features = [
  "Access the top 1% of African voice talent",
  "Dedicated account manager for your team",
  "Custom contracts and volume pricing",
  "Priority support and faster turnaround",
];

const EnterpriseSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const staggerDelays = useStaggerAnimation(features.length, 100);

  return (
    <section ref={ref} className="py-16 md:py-24 bg-navy text-white relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary mb-6 transition-all duration-500 ${isVisible ? 'animate-in fade-in slide-in-from-left-4' : 'opacity-0 translate-x-4'}`}>
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">Enterprise Suite</span>
            </div>
            
            <h2 className={`font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6 transition-all duration-500 delay-100 ${isVisible ? 'animate-in fade-in slide-in-from-left-4' : 'opacity-0 translate-x-4'}`}>
              This is How <span className="gradient-brand-text">Good Companies</span> Find Good Voices.
            </h2>
            
            <p className={`text-lg text-white/70 mb-8 leading-relaxed transition-all duration-500 delay-200 ${isVisible ? 'animate-in fade-in slide-in-from-left-4' : 'opacity-0 translate-x-4'}`}>
              Access the top 1% of African voice talent, plus a full suite of HR and management tools. Build your branded talent bench.
            </p>
            
            <ul className="space-y-4 mb-10">
              {features.map((feature, index) => (
                <li key={index} className={`flex items-start gap-3 transition-all duration-500 ${isVisible ? 'animate-in fade-in slide-in-from-left-4' : 'opacity-0 translate-x-4'}`} style={{ transitionDelay: isVisible ? `${staggerDelays[index]}ms` : '0ms' }}>
                  <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                  <span className="text-white/90">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button variant="secondary" size="lg" asChild>
              <Link to="/register">Learn more about Enterprise</Link>
            </Button>
          </div>

          {/* Image */}
          <div className={`relative hidden lg:block transition-all duration-500 delay-300 ${isVisible ? 'animate-in fade-in slide-in-from-right-4' : 'opacity-0 -translate-x-4'}`}>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
                alt="Enterprise team"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Stats overlay */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-6 shadow-xl border border-border">
              <div className="text-foreground">
                <div className="text-3xl font-heading font-bold gradient-brand-text">98%</div>
                <div className="text-sm text-muted-foreground">Client satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnterpriseSection;
