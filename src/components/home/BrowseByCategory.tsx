import { Link } from "react-router-dom";
import { Mic, Radio, BookOpen, Tv, Gamepad2, Phone, Globe, Headphones } from "lucide-react";

const categories = [
  {
    icon: Mic,
    title: "Commercial",
    description: "TV, radio & web ads",
    count: "2,847",
    link: "/artists?category=commercial",
  },
  {
    icon: BookOpen,
    title: "E-learning",
    description: "Educational content",
    count: "1,523",
    link: "/artists?category=elearning",
  },
  {
    icon: Tv,
    title: "Documentary",
    description: "Narration & storytelling",
    count: "892",
    link: "/artists?category=documentary",
  },
  {
    icon: Radio,
    title: "Radio",
    description: "Jingles & promos",
    count: "1,245",
    link: "/artists?category=radio",
  },
  {
    icon: Gamepad2,
    title: "Gaming",
    description: "Character voices",
    count: "634",
    link: "/artists?category=gaming",
  },
  {
    icon: Headphones,
    title: "Audiobook",
    description: "Long-form narration",
    count: "456",
    link: "/artists?category=audiobook",
  },
  {
    icon: Phone,
    title: "IVR & Phone",
    description: "Phone systems",
    count: "789",
    link: "/artists?category=ivr",
  },
  {
    icon: Globe,
    title: "Localization",
    description: "Multi-language",
    count: "1,102",
    link: "/artists?category=localization",
  },
];

const BrowseByCategory = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
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
          {categories.map((category) => (
            <Link
              key={category.title}
              to={category.link}
              className="category-card group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center group-hover:from-secondary/30 group-hover:to-primary/30 transition-colors">
                  <category.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{category.count} talents</span>
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
