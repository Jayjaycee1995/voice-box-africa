import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ArtistCard from "@/components/artists/ArtistCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Artist {
  id: string | number;
  name: string;
  avatar: string;
  location: string;
  languages: string[];
  pricePerWord: number;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  specialties: string[];
  demoUrl: string;
}

const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $0.10/word", min: 0, max: 0.1 },
  { label: "$0.10 - $0.15/word", min: 0.1, max: 0.15 },
  { label: "$0.15 - $0.20/word", min: 0.15, max: 0.2 },
  { label: "Over $0.20/word", min: 0.2, max: Infinity },
];

const languages = [
  "All Languages",
  "Swahili",
  "Yoruba",
  "Hausa",
  "Zulu",
  "Amharic",
  "English (Nigerian)",
  "English (Kenyan)",
  "English (South African)",
  "Arabic (Egyptian)",
  "Twi",
  "Igbo",
];

interface SupabaseTalent {
  id: string;
  name: string;
  profile_image: string | null;
  skills: string | null;
  bio: string | null;
  is_available: boolean | null;
  demos: {
    file_path: string;
  }[];
}

const Artists = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get("lang") || "All Languages");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchArtists = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*, demos(*)')
          .eq('role', 'talent');

        if (error) throw error;
        
        if (!isMounted) return;

        const talentData = (data as unknown as SupabaseTalent[]).map((talent) => {
          let languages: string[] = [];
          
          if (talent.skills) {
            if (typeof talent.skills === 'string') {
              try {
                // Try parsing as JSON array
                const parsed = JSON.parse(talent.skills);
                if (Array.isArray(parsed)) {
                  languages = parsed;
                } else {
                  // If parsing fails or not array, split by comma
                  languages = talent.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
                }
              } catch (e) {
                // If parsing fails, split by comma
                languages = talent.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
              }
            }
          }

          return {
            id: talent.id,
            name: talent.name,
            avatar: talent.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.name)}&background=random`,
            location: "Africa", // Default location as it's not in the schema yet
            languages,
            pricePerWord: 0.15, // Default price
            rating: 5.0, // Default rating
            reviewCount: 0, // Default review count
            isAvailable: talent.is_available ?? true,
            specialties: talent.bio ? [talent.bio.substring(0, 20) + '...'] : [],
            demoUrl: talent.demos && talent.demos.length > 0 ? talent.demos[0].file_path : "",
          };
        });
        setArtists(talentData);
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch talents", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchArtists();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredArtists = artists.filter((artist) => {
    const matchesSearch =
      searchQuery === "" ||
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLanguage =
      selectedLanguage === "All Languages" ||
      artist.languages.some((l) => l.toLowerCase().includes(selectedLanguage.toLowerCase()));

    const priceRange = priceRanges[selectedPriceRange];
    const matchesPrice =
      artist.pricePerWord >= priceRange.min && artist.pricePerWord <= priceRange.max;

    const matchesAvailability = !showAvailableOnly || artist.isAvailable;

    return matchesSearch && matchesLanguage && matchesPrice && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 md:pt-32 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Browse Voice Talent
            </h1>
            <p className="text-muted-foreground">
              {filteredArtists.length} artists available
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Toggle (Mobile) */}
              <Button
                variant="outline"
                className="md:hidden gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>

              {/* Desktop Filters */}
              <div className="hidden md:flex gap-3">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="h-12 px-4 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 text-foreground"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                  className="h-12 px-4 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 text-foreground"
                >
                  {priceRanges.map((range, index) => (
                    <option key={range.label} value={index}>
                      {range.label}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2 px-4 h-12 border border-input rounded-lg cursor-pointer hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={showAvailableOnly}
                    onChange={(e) => setShowAvailableOnly(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Available only</span>
                </label>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="md:hidden mt-4 p-4 bg-card rounded-xl border border-border space-y-4 animate-fade-in">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Language
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full h-10 px-3 bg-background border border-input rounded-lg text-foreground"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Price Range
                  </label>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-background border border-input rounded-lg text-foreground"
                  >
                    {priceRanges.map((range, index) => (
                      <option key={range.label} value={index}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAvailableOnly}
                    onChange={(e) => setShowAvailableOnly(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Show available only</span>
                </label>
              </div>
            )}
          </div>

          {/* Artist Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground animate-pulse">Loading talented artists...</p>
            </div>
          ) : filteredArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtists.map((artist, index) => (
                <div
                  key={artist.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ArtistCard artist={{ ...artist, id: String(artist.id) }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                No artists found matching your criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLanguage("All Languages");
                  setSelectedPriceRange(0);
                  setShowAvailableOnly(false);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Artists;
