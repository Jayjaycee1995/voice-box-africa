import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ArtistCard from "@/components/artists/ArtistCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Artist {
  id: string;
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

const FeaturedArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedArtists = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*, demos(*)')
          .eq('role', 'talent')
          .limit(6);

        if (error) throw error;

        if (isMounted && data) {
          const formattedArtists = (data as unknown as SupabaseTalent[]).map((talent) => {
            let languages: string[] = [];
            
            if (talent.skills) {
              if (typeof talent.skills === 'string') {
                try {
                  const parsed = JSON.parse(talent.skills);
                  if (Array.isArray(parsed)) {
                    languages = parsed;
                  } else {
                    languages = talent.skills.split(',').map((s) => s.trim()).filter(Boolean);
                  }
                } catch (e) {
                  languages = talent.skills.split(',').map((s) => s.trim()).filter(Boolean);
                }
              }
            }

            return {
              id: talent.id,
              name: talent.name,
              avatar: talent.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.name)}&background=random`,
              location: "Africa", // Default
              languages: languages.slice(0, 2), // Limit to 2 for display
              pricePerWord: 0.15, // Default
              rating: 5.0, // Default
              reviewCount: 0, // Default
              isAvailable: talent.is_available ?? true,
              specialties: talent.bio ? [talent.bio.substring(0, 20) + '...'] : [],
              demoUrl: talent.demos && talent.demos.length > 0 ? talent.demos[0].file_path : "",
            };
          });
          setArtists(formattedArtists);
        }
      } catch (error) {
        console.error("Failed to fetch featured artists", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFeaturedArtists();

    return () => {
      isMounted = false;
    };
  }, []);

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
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : artists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist, index) => (
              <div
                key={artist.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ArtistCard artist={artist} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No featured artists found.
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedArtists;
