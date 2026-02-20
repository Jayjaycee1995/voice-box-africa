import { Link } from "react-router-dom";
import { useScrollAnimation, useStaggerAnimation } from "@/hooks/use-scroll-animation";

const skillCategories = [
  {
    title: "Top languages",
    skills: [
      "English (Nigerian)",
      "Swahili",
      "Yoruba",
      "Hausa",
      "Zulu",
      "Amharic",
      "Arabic (Egyptian)",
      "French (African)",
    ],
  },
  {
    title: "Voice styles",
    skills: [
      "Commercial",
      "Documentary",
      "E-learning",
      "Corporate",
      "Animation",
      "Audiobook",
      "Gaming",
      "Podcast",
    ],
  },
  {
    title: "Accents",
    skills: [
      "Nigerian English",
      "Kenyan English",
      "South African",
      "Ghanaian",
      "Ugandan",
      "Tanzanian",
      "Egyptian Arabic",
      "Moroccan",
    ],
  },
];

const SkillsSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const staggerDelays = useStaggerAnimation(skillCategories.length, 100);

  return (
    <section ref={ref} className="py-12 bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {skillCategories.map((category, index) => (
            <div key={category.title} className={`transition-all duration-500 ${isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: isVisible ? `${staggerDelays[index]}ms` : '0ms' }}>
              <h3 className="font-heading text-sm font-semibold text-foreground mb-4">
                {category.title}
              </h3>
              <ul className="space-y-2">
                {category.skills.map((skill) => (
                  <li key={skill}>
                    <Link
                      to={`/artists?q=${encodeURIComponent(skill)}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {skill}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
