import { Search, UserCheck, CreditCard, Download } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find Your Voice",
    description: "Browse our curated selection of African voice talent. Filter by language, accent, tone, and budget.",
  },
  {
    icon: UserCheck,
    title: "Book Directly",
    description: "Select your artist, upload your script, and get an instant quote. No bidding, no waiting.",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "Pay securely with Paystack, Flutterwave, or Stripe. Your funds are held in escrow until delivery.",
  },
  {
    icon: Download,
    title: "Get Your Audio",
    description: "Receive professional voice-over files, review them, and release payment when satisfied.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-2 block">
            Simple Process
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            How VoiceBox Works
          </h2>
          <p className="text-muted-foreground text-lg">
            From finding the perfect voice to receiving your final audio, 
            we've made the entire process seamless.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative text-center group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-border">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                </div>
              )}

              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <step.icon className="w-8 h-8" />
              </div>

              {/* Step Number */}
              <div className="absolute top-0 right-1/2 translate-x-12 -translate-y-2 w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>

              {/* Content */}
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
