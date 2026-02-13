import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Search,
  Play,
  MessageSquare,
  CreditCard,
  Download,
  Star,
  Shield,
  Clock,
  Headphones,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const clientSteps = [
  {
    icon: Search,
    title: "Browse & Discover",
    description:
      "Search our diverse catalog of African voice talent. Filter by language, accent, tone, and budget to find your perfect match.",
  },
  {
    icon: Play,
    title: "Preview Demos",
    description:
      "Listen to voice samples and demos from each artist. Every profile features professional audio samples showcasing their range.",
  },
  {
    icon: MessageSquare,
    title: "Book Directly",
    description:
      "Found your voice? Click 'Book Now' and provide your project details, script, and requirements through our simple wizard.",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description:
      "Pay securely via Paystack, Flutterwave, or Stripe. Your funds are held in escrow until you approve the final delivery.",
  },
  {
    icon: Download,
    title: "Receive & Approve",
    description:
      "Get your professional voice-over delivered on time. Review, request revisions if needed, and release payment when satisfied.",
  },
  {
    icon: Star,
    title: "Rate & Review",
    description:
      "Share your experience! Your reviews help other clients and reward talented voice artists.",
  },
];

const talentSteps = [
  {
    icon: CheckCircle2,
    title: "Create Your Profile",
    description:
      "Sign up and build a compelling profile showcasing your voice, languages, specialties, and professional equipment.",
  },
  {
    icon: Headphones,
    title: "Upload Demos",
    description:
      "Add high-quality voice samples that demonstrate your range. Multiple demos for different styles attract more clients.",
  },
  {
    icon: CreditCard,
    title: "Set Your Rates",
    description:
      "You're in control. Set your price per word and create package deals that reflect your experience and value.",
  },
  {
    icon: MessageSquare,
    title: "Receive Bookings",
    description:
      "Clients book you directly—no bidding or competing. Review project details and accept jobs that fit your schedule.",
  },
  {
    icon: Download,
    title: "Deliver Excellence",
    description:
      "Record and deliver professional voice-overs. Our platform handles file delivery and revision requests seamlessly.",
  },
  {
    icon: Shield,
    title: "Get Paid Securely",
    description:
      "Funds are released to your account once the client approves. Withdraw to your local bank via M-Pesa, bank transfer, and more.",
  },
];

const features = [
  {
    icon: Shield,
    title: "Secure Escrow",
    description:
      "Your payment is protected. Funds are only released when you're satisfied with the delivery.",
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description:
      "Most projects are delivered within 24-48 hours. Rush options available for urgent needs.",
  },
  {
    icon: Headphones,
    title: "Pro Quality",
    description:
      "All our artists use professional equipment and deliver broadcast-ready audio files.",
  },
  {
    icon: Star,
    title: "Verified Reviews",
    description:
      "All reviews are from real, completed projects. Make informed decisions with confidence.",
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              How VoiceBox Works
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Connect with Africa's finest voice talent in minutes. Our streamlined
              process makes finding and booking voice-over artists simple and secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/artists">Browse Artists</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/register">Join as Talent</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* For Clients Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
                For Clients
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Find Your Perfect Voice in 6 Simple Steps
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From discovery to delivery, our platform handles everything so you can
                focus on your project.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientSteps.map((step, index) => (
                <div
                  key={index}
                  className="relative bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow"
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Talent Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block text-sm font-medium text-accent bg-accent/10 px-4 py-1.5 rounded-full mb-4">
                For Voice Talent
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Turn Your Voice Into Income
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join Africa's premier voice-over marketplace. Set your rates, accept
                bookings, and get paid securely.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {talentSteps.map((step, index) => (
                <div
                  key={index}
                  className="relative bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow"
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose VoiceBox?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built specifically for the African market with features that matter.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl bg-card shadow-card"
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Join thousands of clients and voice artists already using VoiceBox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-primary hover:bg-white/90 gap-2"
                asChild
              >
                <Link to="/artists">
                  Find Voice Talent
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/register">Join as Artist</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
