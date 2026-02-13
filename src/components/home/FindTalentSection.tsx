import { Link } from "react-router-dom";
import { ArrowRight, Search, Users, Headphones } from "lucide-react";

const options = [
  {
    icon: Search,
    title: "Browse and book voice demos",
    description: "Voice Catalog™",
    link: "/artists",
    linkText: "Browse demos",
  },
  {
    icon: Users,
    title: "Post a project and hire a professional",
    description: "Talent Marketplace™",
    link: "/register",
    linkText: "Post a project",
  },
  {
    icon: Headphones,
    title: "Let us help you find the right voice",
    description: "Talent Scout™",
    link: "/register",
    linkText: "Get started",
  },
];

const FindTalentSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <div className="relative hidden lg:block">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=500&fit=crop"
                alt="Professional at work"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Decorative element */}
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-primary opacity-20 blur-xl" />
          </div>

          {/* Right Content */}
          <div>
            <p className="text-sm font-medium text-secondary mb-2">For clients</p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Find talent
              <br />
              <span className="gradient-brand-text">your way</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Work with the largest network of African voice professionals and get things done—from quick turnarounds to big transformations.
            </p>

            {/* Options */}
            <div className="grid gap-4">
              {options.map((option) => (
                <Link
                  key={option.title}
                  to={option.link}
                  className="group bg-card p-6 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center shrink-0 group-hover:from-secondary/20 group-hover:to-primary/20 transition-colors">
                      <option.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {option.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{option.description}</span>
                        <span className="text-primary flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          {option.linkText}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FindTalentSection;
