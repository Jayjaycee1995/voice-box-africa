import { useState, useEffect } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import WaveformVisualizer from "@/components/audio/WaveformVisualizer";
import InviteModal from "@/components/invitation/InviteModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
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
  Loader2,
} from "lucide-react";

interface Artist {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  location: string;
  languages: string[];
  pricePerWord: number;
  flatRates: { words: number; price: number }[];
  rating: number;
  reviewCount: number;
  completedJobs: number;
  isAvailable: boolean;
  responseTime: string;
  memberSince: string;
  bio: string;
  specialties: string[];
  equipment: string[];
  demos: { id: string | number; title: string; duration: string; file_path: string }[];
  reviews: Record<string, unknown>[];
}

const ArtistProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const [playingDemo, setPlayingDemo] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*, demos(*)')
          .eq('id', id)
          .single();

        if (error) throw error;

        const talent: Artist = {
          id: data.id,
          name: data.name,
          avatar: data.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
          coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=400&fit=crop", // Default cover
          location: "Africa", // Default location
          languages: (() => {
            if (!data.skills) return [];
            if (typeof data.skills === 'string') {
              try {
                const parsed = JSON.parse(data.skills);
                if (Array.isArray(parsed)) return parsed;
                return data.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
              } catch (e) {
                return data.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
              }
            }
            return [];
          })(),
          pricePerWord: 0.15,
          flatRates: [
            { words: 100, price: 20 },
            { words: 250, price: 45 },
            { words: 500, price: 80 },
          ],
          rating: 5.0,
          reviewCount: 0,
          completedJobs: 0,
          isAvailable: data.is_available ?? true,
          responseTime: "24 hours",
          memberSince: new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          bio: data.bio || "No bio available.",
          specialties: [], // Can extract from bio or skills
          equipment: [], // Need a field for this
          demos: data.demos || [],
          reviews: [], // Need to fetch reviews
        };
        setArtist(talent);
      } catch (error) {
        console.error("Failed to fetch artist", error);
        toast({
          title: "Error",
          description: "Failed to load artist profile.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtist();
  }, [id, toast]);

  const toggleDemo = (demoId: string) => {
    setPlayingDemo(playingDemo === demoId ? null : demoId);
  };

  const handleActionWithAuth = (action: () => void) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to perform this action.",
      });
      navigate("/login", { state: { from: `${location.pathname}${location.search}`, role: "client" } });
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
      navigate("/login", { state: { from: `${location.pathname}${location.search}`, role: "client" } });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Header />
        <p className="text-xl text-muted-foreground">Artist not found.</p>
        <Button onClick={() => navigate('/artists')}>Back to Artists</Button>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 md:pt-20">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 bg-muted">
          <img
            src={artist.coverImage}
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
                      src={artist.avatar}
                      alt={artist.name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-card"
                    />
                    {artist.isAvailable && (
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
                          {artist.name}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{artist.location}</span>
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
                          {artist.rating}
                        </span>
                        <span className="text-muted-foreground">
                          ({artist.reviewCount} reviews)
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 inline mr-1" />
                        {artist.completedJobs} jobs completed
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="flex flex-wrap gap-2">
                      {artist.languages.map((lang) => (
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
                  {artist.bio}
                </p>

                {/* Specialties */}
                <h3 className="font-semibold text-foreground mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {artist.specialties.map((specialty) => (
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
                  {artist.equipment.map((item) => (
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
                  {artist.demos.map((demo) => (
                    <div
                      key={demo.id}
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl"
                    >
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => toggleDemo(String(demo.id))}
                      >
                        {playingDemo === String(demo.id) ? (
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
                          isPlaying={playingDemo === String(demo.id)}
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
                    Reviews ({artist.reviewCount})
                  </h2>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-secondary text-secondary" />
                    <span className="font-semibold text-foreground">
                      {artist.rating}
                    </span>
                  </div>
                </div>
                <div className="space-y-6">
                  {artist.reviews.map((review) => (
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
                        ${artist.pricePerWord.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">/word</span>
                    </div>
                  </div>

                  {/* Quick Packages */}
                  <div className="space-y-2 mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Quick Packages</h4>
                    {artist.flatRates.map((rate) => (
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
                    <Link to={`/book/${artist.id}`}>
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
                        {artist.responseTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Member since</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {artist.memberSince}
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
        artistId={artist.id}
        artistName={artist.name}
      />
    </div>
  );
};

export default ArtistProfile;
