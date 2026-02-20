import { Link } from "react-router-dom";
import { Mic, Radio, BookOpen, Tv, Gamepad2, Phone, Globe, Headphones } from "lucide-react";
import { useScrollAnimation, useStaggerAnimation } from "@/hooks/use-scroll-animation";

const categories = [
  {
    icon: Mic,
    title: "Commercial",
    description: "TV, radio & web ads",
    link: "/artists?category=commercial",
  },
  {
    icon: BookOpen,
    title: "E-learning",
    description: "Educational content",
    link: "/artists?category=elearning",
  },
  {
    icon: Tv,
    title: "Documentary",
    description: "Narration & storytelling",
    link: "/artists?category=documentary",
  },
  {
    icon: Radio,
    title: "Radio",
    description: "Jingles & promos",
    link: "/artists?category=radio",
  },
  {
    icon: Gamepad2,
    title: "Gaming",
    description: "Character voices",
    link: "/artists?category=gaming",
  },
  {
    icon: Headphones,
    title: "Audiobook",
    description: "Long-form narration",
    link: "/artists?category=audiobook",
  },
  {
    icon: Phone,
    title: "IVR & Phone",
    description: "Phone systems",
    link: "/artists?category=ivr",
  },
  {
    icon: Globe,
    title: "Localization",
    description: "Multi-language",
    link: "/artists?category=localization",
  },
];

const BrowseByCategory = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const staggerDelays = useStaggerAnimation(categories.length, 75);

  return (
    <section ref={ref} className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium text-secondary mb-2">Browse talent by category</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Looking for work? <Link to="/browse-gigs" className="text-primary hover:underline">Browse opportunities</Link>
            </h2>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.title}
              to={category.link}
              className={`category-card group transition-all duration-500 ${isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: isVisible ? `${staggerDelays[index]}ms` : '0ms' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center group-hover:from-secondary/30 group-hover:to-primary/30 transition-colors">
                  <category.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {category.title}
              </h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrowseByCategory;
