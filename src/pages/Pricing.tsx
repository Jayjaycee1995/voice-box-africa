import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, HelpCircle, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const pricingTiers = [
  {
    name: "Standard",
    wordRange: "Up to 100 words",
    priceRange: "$15 - $25",
    avgPrice: "$20",
    features: [
      "Professional quality audio",
      "48-hour delivery",
      "1 revision included",
      "Commercial rights",
      "MP3/WAV formats",
    ],
    popular: false,
  },
  {
    name: "Professional",
    wordRange: "100 - 500 words",
    priceRange: "$25 - $100",
    avgPrice: "$60",
    features: [
      "Broadcast-ready audio",
      "24-48 hour delivery",
      "2 revisions included",
      "Full commercial rights",
      "Multiple format delivery",
      "Background music sync",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    wordRange: "500+ words",
    priceRange: "$100+",
    avgPrice: "Custom",
    features: [
      "Premium studio quality",
      "Priority turnaround",
      "Unlimited revisions",
      "Full buyout rights available",
      "Multi-language options",
      "Dedicated support",
      "Volume discounts",
    ],
    popular: false,
  },
];

const faqs = [
  {
    question: "How is pricing calculated?",
    answer:
      "Voice artists set their own rates, typically charged per word. When you submit your script, our system automatically calculates the total cost based on word count and the artist's rate. Additional fees may apply for rush delivery or extended usage rights.",
  },
  {
    question: "What's included in the price?",
    answer:
      "Standard pricing includes professional studio-quality recording, basic editing, and delivery in common audio formats (MP3/WAV). Usage rights for your specified platform are included. Additional services like background music, complex editing, or extended rights may cost extra.",
  },
  {
    question: "How does the escrow system work?",
    answer:
      "When you book a project, your payment is held securely in escrow. The artist can see the funds are secured, but the money is only released to them after you approve the final delivery. This protects both parties and ensures quality.",
  },
  {
    question: "What if I'm not satisfied with the recording?",
    answer:
      "Every project includes at least one revision. If the final delivery doesn't match your brief, you can request changes. For disputes, our admin team reviews the project details and mediates to find a fair resolution.",
  },
  {
    question: "Are there any platform fees?",
    answer:
      "VoiceBox charges a 10% service fee on each transaction to cover platform costs, payment processing, and support. This fee is already factored into the displayed prices—what you see is what you pay.",
  },
  {
    question: "How do rush orders work?",
    answer:
      "Rush delivery (within 24 hours) is available for an additional 50% of the base price. This is subject to artist availability. When booking, simply check the 'Rush Delivery' option and the updated price will be shown.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We support Paystack and Flutterwave for African payments (cards, bank transfers, M-Pesa, etc.) and Stripe for international transactions. All payments are secure and encrypted.",
  },
  {
    question: "Can I negotiate prices with artists?",
    answer:
      "For large projects or ongoing work, you can send a pre-booking inquiry to discuss custom rates. Many artists offer discounts for volume orders or long-term partnerships.",
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/5 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Transparent, Fair Pricing
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Voice artists set their own rates. You pay what you see—no hidden fees
              or surprise charges.
            </p>
            <p className="text-sm text-muted-foreground">
              Average rates: <span className="font-semibold text-foreground">$0.10 - $0.25</span> per word
            </p>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl p-6 md:p-8 ${
                    tier.popular
                      ? "bg-primary text-primary-foreground shadow-xl ring-2 ring-primary scale-105"
                      : "bg-card shadow-card"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3
                      className={`font-serif text-xl font-semibold mb-1 ${
                        tier.popular ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {tier.name}
                    </h3>
                    <p
                      className={`text-sm ${
                        tier.popular ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {tier.wordRange}
                    </p>
                  </div>

                  <div className="text-center mb-6">
                    <div
                      className={`text-3xl font-bold mb-1 ${
                        tier.popular ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {tier.avgPrice}
                    </div>
                    <p
                      className={`text-sm ${
                        tier.popular ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {tier.priceRange}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2
                          className={`w-5 h-5 shrink-0 ${
                            tier.popular ? "text-secondary" : "text-accent"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            tier.popular
                              ? "text-primary-foreground/90"
                              : "text-muted-foreground"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={tier.popular ? "secondary" : "default"}
                    className={`w-full ${
                      tier.popular ? "bg-white text-primary hover:bg-white/90" : ""
                    }`}
                    asChild
                  >
                    <Link to="/artists">Browse Artists</Link>
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              * Prices vary based on individual artist rates, project complexity, and usage rights.
            </p>
          </div>
        </section>

        {/* How Pricing Works */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                How Pricing Works
              </h2>
              <p className="text-muted-foreground">
                Understand exactly what you're paying for—no surprises.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card">
              <div className="space-y-6">
                <div className="flex items-start gap-4 pb-6 border-b border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Base Price</h4>
                    <p className="text-sm text-muted-foreground">
                      Calculated as: <span className="font-medium text-foreground">Word Count × Artist's Rate</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Example: 250 words × $0.15/word = $37.50
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-6 border-b border-border">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <span className="font-bold text-secondary">+</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Optional Add-ons</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Rush delivery (24h): +50% of base price</li>
                      <li>• Extended usage rights: Varies by artist</li>
                      <li>• Background music: Typically $10-25</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="font-bold text-accent">=</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Total Price</h4>
                    <p className="text-sm text-muted-foreground">
                      The final amount shown includes all fees. VoiceBox's 10% service fee
                      is already factored in—no extra charges at checkout.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                <HelpCircle className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about pricing and payments.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card rounded-xl border border-border px-6"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-accent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-accent-foreground mb-4">
              Ready to Find Your Voice?
            </h2>
            <p className="text-lg text-accent-foreground/80 max-w-xl mx-auto mb-8">
              Browse our talented artists and get an instant quote for your project.
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-accent hover:bg-white/90 gap-2"
              asChild
            >
              <Link to="/artists">
                Browse Artists
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
