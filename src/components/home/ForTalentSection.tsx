import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, Eye, Wallet } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Find opportunities",
    description: "matched to your skills.",
  },
  {
    icon: Eye,
    title: "Get noticed",
    description: "by clients actively searching.",
  },
  {
    icon: Wallet,
    title: "Explore different",
    description: "ways to earn.",
  },
];

const ForTalentSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/50 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <p className="text-sm font-medium text-secondary mb-2">For Talent</p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Find a great
              <br />
              <span className="gradient-brand-text">opportunity</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Meet clients you're excited to work with and take your career or business to new heights. Africa's voice is waiting to be heard.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="text-center lg:text-left">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center mb-3 mx-auto lg:mx-0">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-foreground mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg" asChild>
              <Link to="/register">Find opportunities</Link>
            </Button>
          </div>

          {/* Image */}
          <div className="relative order-1 lg:order-2">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=600&h=400&fit=crop"
                alt="Voice talent recording"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Floating element */}
            <div className="absolute -bottom-4 -right-4 bg-card rounded-xl px-5 py-3 shadow-xl border border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-sm font-medium text-foreground">Join 500+ talents</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForTalentSection;
