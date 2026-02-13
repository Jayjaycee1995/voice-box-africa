import { Link } from "react-router-dom";
import ArtistCard from "@/components/artists/ArtistCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Mock data for featured artists
const featuredArtists = [
  {
    id: "1",
    name: "Amara Okonkwo",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face",
    location: "Lagos, Nigeria",
    languages: ["English (Nigerian)", "Yoruba"],
    pricePerWord: 0.15,
    rating: 4.9,
    reviewCount: 127,
    isAvailable: true,
    specialties: ["Commercial", "Documentary"],
    demoUrl: "/demos/amara-demo.mp3",
  },
  {
    id: "2",
    name: "Kwame Mensah",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    location: "Accra, Ghana",
    languages: ["English (Ghanaian)", "Twi"],
    pricePerWord: 0.12,
    rating: 4.8,
    reviewCount: 89,
    isAvailable: true,
    specialties: ["E-learning", "Corporate"],
    demoUrl: "/demos/kwame-demo.mp3",
  },
  {
    id: "3",
    name: "Zainab Ahmed",
    avatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=400&fit=crop&crop=face",
    location: "Nairobi, Kenya",
    languages: ["Swahili", "English (Kenyan)"],
    pricePerWord: 0.18,
    rating: 5.0,
    reviewCount: 203,
    isAvailable: false,
    specialties: ["Animation", "Audiobook"],
    demoUrl: "/demos/zainab-demo.mp3",
  },
  {
    id: "4",
    name: "Thabo Molefe",
    avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=400&fit=crop&crop=face",
    location: "Johannesburg, South Africa",
    languages: ["English (South African)", "Zulu"],
    pricePerWord: 0.20,
    rating: 4.7,
    reviewCount: 64,
    isAvailable: true,
    specialties: ["Commercial", "Promo"],
    demoUrl: "/demos/thabo-demo.mp3",
  },
  {
    id: "5",
    name: "Fatima Hassan",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    location: "Cairo, Egypt",
    languages: ["Arabic (Egyptian)", "English"],
    pricePerWord: 0.16,
    rating: 4.9,
    reviewCount: 156,
    isAvailable: true,
    specialties: ["Documentary", "Narration"],
    demoUrl: "/demos/fatima-demo.mp3",
  },
  {
    id: "6",
    name: "Chidi Nwosu",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    location: "Port Harcourt, Nigeria",
    languages: ["English (Nigerian)", "Igbo"],
    pricePerWord: 0.14,
    rating: 4.6,
    reviewCount: 42,
    isAvailable: true,
    specialties: ["Gaming", "Animation"],
    demoUrl: "/demos/chidi-demo.mp3",
  },
];

const FeaturedArtists = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-2 block">
              Featured Talent
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Top Voice Artists
            </h2>
          </div>
          <Button variant="ghost" asChild className="group">
            <Link to="/artists" className="flex items-center gap-2">
              View All Artists
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredArtists.map((artist, index) => (
            <div
              key={artist.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ArtistCard artist={artist} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtists;
