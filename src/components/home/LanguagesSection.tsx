import { Globe2 } from "lucide-react";

const languages = [
  { name: "Swahili", region: "East Africa", artistCount: 45 },
  { name: "Yoruba", region: "West Africa", artistCount: 32 },
  { name: "Hausa", region: "West Africa", artistCount: 28 },
  { name: "Zulu", region: "Southern Africa", artistCount: 24 },
  { name: "Amharic", region: "East Africa", artistCount: 19 },
  { name: "Arabic (Egyptian)", region: "North Africa", artistCount: 37 },
  { name: "French (African)", region: "Francophone Africa", artistCount: 41 },
  { name: "Portuguese", region: "Lusophone Africa", artistCount: 22 },
  { name: "English (Nigerian)", region: "West Africa", artistCount: 56 },
  { name: "English (Kenyan)", region: "East Africa", artistCount: 31 },
  { name: "English (SA)", region: "Southern Africa", artistCount: 29 },
  { name: "Twi", region: "Ghana", artistCount: 18 },
];

const LanguagesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-charcoal text-cream overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Globe2 className="w-6 h-6 text-primary" />
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            Languages
          </span>
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4">
          Voices Across Africa
        </h2>
        <p className="text-cream/60 text-center text-lg max-w-2xl mx-auto mb-12">
          From Swahili to Zulu, we represent the rich linguistic diversity of the African continent.
        </p>

        {/* Languages Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {languages.map((lang, index) => (
            <div
              key={lang.name}
              className="group p-4 rounded-xl bg-cream/5 hover:bg-primary/20 border border-cream/10 hover:border-primary/40 transition-all duration-300 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <h3 className="font-semibold text-cream group-hover:text-primary transition-colors mb-1">
                {lang.name}
              </h3>
              <p className="text-sm text-cream/50 mb-2">{lang.region}</p>
              <p className="text-xs text-primary font-medium">
                {lang.artistCount} artists
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LanguagesSection;
