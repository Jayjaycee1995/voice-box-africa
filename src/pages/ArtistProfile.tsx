import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import WaveformVisualizer from "@/components/audio/WaveformVisualizer";
import InviteModal from "@/components/invitation/InviteModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Pause,
  Star,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  MessageCircle,
  Share2,
  Heart,
  UserPlus,
} from "lucide-react";

// Mock artist data
const artistData = {
  id: "1",
  name: "Amara Okonkwo",
  avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=400&fit=crop",
  location: "Lagos, Nigeria",
  languages: ["English (Nigerian)", "Yoruba", "Pidgin English"],
  pricePerWord: 0.15,
  flatRates: [
    { words: 100, price: 20 },
    { words: 250, price: 45 },
    { words: 500, price: 80 },
  ],
  rating: 4.9,
  reviewCount: 127,
  completedJobs: 234,
  isAvailable: true,
  responseTime: "2 hours",
  memberSince: "January 2022",
  bio: "Professional voice-over artist with 8+ years of experience in commercial, documentary, and e-learning projects. My warm, versatile voice has been featured in campaigns for MTN, Coca-Cola Africa, and numerous international brands. I bring authenticity and professionalism to every project.",
  specialties: ["Commercial", "Documentary", "E-learning", "Corporate", "Animation"],
  equipment: ["Neumann TLM 103", "Apollo Twin X", "Treated Studio"],
  demos: [
    { id: "1", title: "Commercial Demo", duration: "1:32" },
    { id: "2", title: "Documentary Reel", duration: "2:15" },
    { id: "3", title: "E-learning Sample", duration: "1:48" },
  ],
  reviews: [
    {
      id: "1",
      author: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      date: "2 weeks ago",
      content: "Amara delivered exceptional quality for our TV commercial. Her Nigerian English accent was exactly what we needed. Quick turnaround and very professional.",
      project: "TV Commercial - 30 sec",
    },
    {
      id: "2",
      author: "Lisa Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      date: "1 month ago",
      content: "Second time working with Amara. She nails the brief every time. The Yoruba pronunciation guide I provided was followed perfectly.",
      project: "Documentary Narration",
    },
  ],
};

const ArtistProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const [playingDemo, setPlayingDemo] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const toggleDemo = (demoId: string) => {
    setPlayingDemo(playingDemo === demoId ? null : demoId);
  };

  const handleActionWithAuth = (action: () => void) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to perform this action.",
      });
      navigate("/login");
      return;
    }
    action();
  };

  const handleOpenInviteModal = () => {
    handleActionWithAuth(() => {
      setIsInviteModalOpen(true);
    });
  };

  const handleBookNow = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast({
        title: "Authentication required",
        description: "Please log in to book an artist.",
      });
      navigate("/login");
    }
  };

  const handleSendEnquiry = () => {
    handleActionWithAuth(() => {
      // Logic for sending enquiry
      toast({
        title: "Coming soon",
        description: "The enquiry feature is being developed.",
      });
    });
  };

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 md:pt-20">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 bg-muted">
          <img
            src={artistData.coverImage}
            alt="Studio"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 -mt-16 relative z-10">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={artistData.avatar}
                      alt={artistData.name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-card"
                    />
                    {artistData.isAvailable && (
                      <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded-full">
                        Available
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-1">
                          {artistData.name}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{artistData.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsFavorited(!isFavorited)}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFavorited ? "fill-destructive text-destructive" : ""
                            }`}
                          />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-secondary text-secondary" />
                        <span className="font-semibold text-foreground">
                          {artistData.rating}
                        </span>
                        <span className="text-muted-foreground">
                          ({artistData.reviewCount} reviews)
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 inline mr-1" />
                        {artistData.completedJobs} jobs completed
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="flex flex-wrap gap-2">
                      {artistData.languages.map((lang) => (
                        <span
                          key={lang}
                          className="text-sm px-3 py-1 bg-muted rounded-full text-muted-foreground"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  About
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {artistData.bio}
                </p>

                {/* Specialties */}
                <h3 className="font-semibold text-foreground mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {artistData.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="text-sm px-3 py-1 bg-primary/10 rounded-full text-primary font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                {/* Equipment */}
                <h3 className="font-semibold text-foreground mb-3">Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {artistData.equipment.map((item) => (
                    <span
                      key={item}
                      className="text-sm px-3 py-1 bg-accent/10 rounded-full text-accent"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Demos */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Voice Demos
                </h2>
                <div className="space-y-4">
                  {artistData.demos.map((demo) => (
                    <div
                      key={demo.id}
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl"
                    >
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => toggleDemo(demo.id)}
                      >
                        {playingDemo === demo.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{demo.title}</h4>
                        <p className="text-sm text-muted-foreground">{demo.duration}</p>
                      </div>
                      <div className="flex-1">
                        <WaveformVisualizer
                          isPlaying={playingDemo === demo.id}
                          barCount={60}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl font-semibold text-foreground">
                    Reviews ({artistData.reviewCount})
                  </h2>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-secondary text-secondary" />
                    <span className="font-semibold text-foreground">
                      {artistData.rating}
                    </span>
                  </div>
                </div>
                <div className="space-y-6">
                  {artistData.reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <img
                          src={review.avatar}
                          alt={review.author}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-foreground">{review.author}</h4>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-secondary text-secondary" />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">• {review.project}</span>
                          </div>
                          <p className="text-muted-foreground text-sm">{review.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Pricing Card */}
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="mb-6">
                    <span className="text-sm text-muted-foreground">Starting at</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">
                        ${artistData.pricePerWord.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">/word</span>
                    </div>
                  </div>

                  {/* Quick Packages */}
                  <div className="space-y-2 mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Quick Packages</h4>
                    {artistData.flatRates.map((rate) => (
                      <div
                        key={rate.words}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="text-sm text-muted-foreground">
                          Up to {rate.words} words
                        </span>
                        <span className="font-semibold text-foreground">${rate.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Book Button */}
                  <Button variant="hero" size="lg" className="w-full mb-3" asChild onClick={handleBookNow}>
                    <Link to={`/book/${artistData.id}`}>
                      Book Now
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full gap-2 mb-3" onClick={handleSendEnquiry}>
                    <MessageCircle className="w-4 h-4" />
                    Send Inquiry
                  </Button>
                  <Button variant="default" size="lg" className="w-full gap-2" onClick={handleOpenInviteModal}>
                    <UserPlus className="w-4 h-4" />
                    Invite to Project
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Response time</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {artistData.responseTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Member since</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {artistData.memberSince}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-16" />
      </main>
      <Footer />
      
      {/* Invitation Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={handleCloseInviteModal}
        artistId={artistData.id}
        artistName={artistData.name}
      />
    </div>
  );
};

export default ArtistProfile;
