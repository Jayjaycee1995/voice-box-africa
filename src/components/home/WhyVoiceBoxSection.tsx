import { Star, Shield, Award, Zap } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Proof of quality",
    description: "Check any voice artist's work samples, client reviews, and identity verification before booking.",
  },
  {
    icon: Zap,
    title: "No cost until you hire",
    description: "Browse profiles and listen to demos for free. Only pay when you book a voice artist.",
  },
  {
    icon: Award,
    title: "Safe and secure",
    description: "Focus on your work knowing we help protect your data and privacy. Your payment is held in escrow until delivery.",
  },
];

const stats = [
  { value: "4.9/5", label: "Client satisfaction" },
  { value: "Award winner", label: "Best African Marketplace 2024" },
];

const WhyVoiceBoxSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <p className="text-sm font-medium text-secondary mb-2">Why choose us</p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-10">
              Why businesses turn to <span className="gradient-brand-text">Voibox</span>
            </h2>

            <div className="space-y-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Stats Card */}
          <div className="bg-gradient-to-br from-navy to-navy/90 rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="mb-8">
                <p className="text-sm text-white/60 mb-2">We're</p>
                <h3 className="font-heading text-3xl font-bold">
                  Africa's voice
                  <br />
                  marketplace
                </h3>
              </div>

              <div className="space-y-4 mb-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-secondary fill-secondary" />
                      <span className="font-heading text-lg font-bold">{stat.value}</span>
                    </div>
                    <p className="text-sm text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-white/10">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-heading text-3xl font-bold text-secondary">500+</div>
                    <div className="text-xs text-white/60">Artists</div>
                  </div>
                  <div>
                    <div className="font-heading text-3xl font-bold text-secondary">50+</div>
                    <div className="text-xs text-white/60">Languages</div>
                  </div>
                  <div>
                    <div className="font-heading text-3xl font-bold text-secondary">10K+</div>
                    <div className="text-xs text-white/60">Projects</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyVoiceBoxSection;
