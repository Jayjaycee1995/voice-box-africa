import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaveformVisualizer from "@/components/audio/WaveformVisualizer";

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

interface ArtistCardProps {
  artist: Artist;
}

const ArtistCard = ({ artist }: ArtistCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  return (
    <Link to={`/artists/${artist.id}`} className="block">
      <div className="card-elevated p-4 group">
        {/* Header with Avatar and Play Button */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="relative">
            <img
              src={artist.avatar}
              alt={artist.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
            {/* Play Button Overlay */}
            <Button
              variant="default"
              size="iconSm"
              onClick={togglePlay}
              className="absolute -bottom-2 -right-2 w-8 h-8"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3 ml-0.5" />
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-heading font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {artist.name}
              </h3>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  artist.isAvailable
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {artist.isAvailable ? "Available" : "Busy"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{artist.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-secondary text-secondary" />
                <span className="text-sm font-medium text-foreground">
                  {artist.rating}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({artist.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Waveform Preview */}
        <div className="mb-4">
          <WaveformVisualizer isPlaying={isPlaying} />
        </div>

        {/* Languages */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {artist.languages.map((lang) => (
            <span
              key={lang}
              className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground"
            >
              {lang}
            </span>
          ))}
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {artist.specialties.map((specialty) => (
            <span
              key={specialty}
              className="text-xs px-2 py-1 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-md text-primary font-medium"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-xs text-muted-foreground">Starting at</span>
            <p className="text-lg font-heading font-bold text-foreground">
              ${artist.pricePerWord.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">
                /word
              </span>
            </p>
          </div>
          <Button variant="default" size="sm">
            View Profile
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ArtistCard;
