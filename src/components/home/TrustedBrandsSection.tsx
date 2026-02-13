import { ArrowRight } from "lucide-react";

// Top 50 African Brands
const africanBrands = [
  "MTN", "Safaricom", "Dangote", "Shoprite", "Vodacom",
  "First Bank Nigeria", "Standard Bank", "Ecobank", "Nando's", "MultiChoice",
  "DSTV", "GOTV", "Airtel Africa", "Globacom", "UBA",
  "Access Bank", "Zenith Bank", "Guaranty Trust Bank", "Sterling Bank", "Fidelity Bank",
  "Telkom", "Cell C", "Rain", "Liquid Telecom", "Sasol",
  "Anglo American", "De Beers", "SABMiller", "Tiger Brands", "Shoprite Holdings",
  "Pick n Pay", "Woolworths", "Mr Price", "Massmart", "Bidvest",
  "Naspers", "MTN Nigeria", "Safaricom Kenya", "Equity Bank", "KCB Group",
  "Co-operative Bank", "Family Bank", "I&M Bank", "NCBA Group", "Diamond Trust Bank",
  "Absa Group", "Nedbank", "Investec", "Old Mutual", "Sanlam"
];

const testimonials = [
  {
    company: "MTN Group",
    logo: "MTN",
    bgClass: "bg-gradient-to-br from-secondary to-secondary/80",
    quote: "Voibox enables us to find authentic African voices that resonate with our customers across different regions.",
    author: "Sarah Okafor",
    role: "Head of Marketing, MTN Nigeria",
    stats: [
      { label: "Emmy Winning", value: "Brand Campaigns" },
      { label: "Millions", value: "Views on commercials" },
    ],
  },
  {
    company: "Safaricom",
    logo: "Safaricom",
    bgClass: "bg-gradient-to-br from-primary to-primary/80",
    quote: "One of the advantages of working with Voibox is finding talent with different accents quickly as our needs change.",
    author: "Daniel Mwangi",
    role: "Executive VP of Marketing",
    stats: [
      { label: "50x Faster", value: "Time-to-production" },
      { label: "10,000+", value: "Projects completed" },
    ],
  },
];

const TrustedBrandsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-secondary mb-2">Trusted by the best</p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Trusted by leading
            <br />
            <span className="gradient-brand-text">brands and agencies</span>
          </h2>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.company}
              className={`${testimonial.bgClass} rounded-2xl p-8 text-white shadow-xl`}
            >
              <div className="font-heading text-2xl font-bold mb-6">{testimonial.logo}</div>
              <blockquote className="text-lg mb-6 leading-relaxed opacity-95">
                "{testimonial.quote}"
              </blockquote>
              <div className="mb-8">
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-sm opacity-80">{testimonial.role}</div>
              </div>
              <div className="pt-6 border-t border-white/20">
                <p className="text-sm opacity-70 mb-3">Results</p>
                <div className="grid grid-cols-2 gap-4">
                  {testimonial.stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="font-heading text-lg font-bold">{stat.label}</div>
                      <div className="text-sm opacity-80">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Animated Brands Marquee */}
        <div className="mt-16">
          <div className="relative overflow-hidden">
            {/* Fade gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
            
            {/* Marquee container */}
            <div className="flex space-x-8 animate-marquee whitespace-nowrap">
              {africanBrands.map((brand) => (
                <div
                  key={brand}
                  className="inline-flex items-center px-6 py-3 bg-muted/50 rounded-full border border-border/50 backdrop-blur-sm transition-all duration-300 hover:bg-primary/10 hover:border-primary/30 hover:scale-105 group"
                >
                  <span className="text-lg font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                    {brand}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* See more link */}
        <div className="mt-10 text-center">
          <a href="#" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
            See more customer stories
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default TrustedBrandsSection;
