import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/database.types";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Search, Music, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const PRODUCER_SKILL_OPTIONS = [
  "mixing",
  "mastering",
  "vocal_production",
  "voice_tuning",
  "sound_design",
  "editing",
];

export default function ProducerDiscovery() {
  const navigate = useNavigate();
  const [producers, setProducers] = useState<User[]>([]);
  const [filteredProducers, setFilteredProducers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [maxRate, setMaxRate] = useState<string>("999");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    fetchProducers();
  }, []);

  const fetchProducers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("is_official_producer", true)
        .order("name");

      if (error) throw error;
      setProducers(data || []);
      setFilteredProducers(data || []);

      if (data && data.length > 0) {
        const { data: ratingsData, error: ratingsError } = await supabase
          .from("producer_ratings")
          .select("producer_id, rating");

        if (!ratingsError && ratingsData) {
          const ratingMap: Record<string, { avg: number; count: number }> = {};
          ratingsData.forEach((r) => {
            if (!ratingMap[r.producer_id]) {
              ratingMap[r.producer_id] = { avg: 0, count: 0 };
            }
            ratingMap[r.producer_id].avg += r.rating;
            ratingMap[r.producer_id].count += 1;
          });

          Object.keys(ratingMap).forEach((producerId) => {
            ratingMap[producerId].avg /= ratingMap[producerId].count;
          });

          setRatings(ratingMap);
        }
      }
    } catch (error) {
      console.error("Error fetching producers:", error);
      toast.error("Failed to load producers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = producers.filter((producer) => {
      const matchesSearch =
        producer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producer.bio?.toLowerCase().includes(searchTerm.toLowerCase());

      const producerSkills = producer.producer_skills || [];
      const matchesSkill =
        selectedSkill === "all" || producerSkills.includes(selectedSkill);

      const rate = producer.production_rate_per_hour || 0;
      const matchesRate = rate <= parseFloat(maxRate);

      return matchesSearch && matchesSkill && matchesRate;
    });

    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => (ratings[b.id]?.avg || 0) - (ratings[a.id]?.avg || 0));
        break;
      case "rate-low":
        filtered.sort((a, b) => (a.production_rate_per_hour || 0) - (b.production_rate_per_hour || 0));
        break;
      case "rate-high":
        filtered.sort((a, b) => (b.production_rate_per_hour || 0) - (a.production_rate_per_hour || 0));
        break;
      case "turnaround":
        filtered.sort((a, b) => (a.turnaround_time_days || 0) - (b.turnaround_time_days || 0));
        break;
    }

    setFilteredProducers(filtered);
  }, [searchTerm, selectedSkill, maxRate, sortBy, producers, ratings]);

  const getProducerRating = (producerId: string) => {
    return ratings[producerId] || { avg: 0, count: 0 };
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Find Your Audio Producer</h1>
          <p className="text-lg text-muted-foreground">
            Browse and hire professional audio producers for your projects.
          </p>
        </div>

        <div className="mb-8 p-6 bg-card border rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search producers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {PRODUCER_SKILL_OPTIONS.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={maxRate} onValueChange={setMaxRate}>
              <SelectTrigger>
                <SelectValue placeholder="Max Rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">Up to $50/hr</SelectItem>
                <SelectItem value="75">Up to $75/hr</SelectItem>
                <SelectItem value="100">Up to $100/hr</SelectItem>
                <SelectItem value="150">Up to $150/hr</SelectItem>
                <SelectItem value="999">Any rate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="rate-low">Price: Low to High</SelectItem>
                <SelectItem value="rate-high">Price: High to Low</SelectItem>
                <SelectItem value="turnaround">Fastest Turnaround</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : filteredProducers.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="py-16 text-center">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No producers found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to find the right producer for your project.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducers.map((producer) => {
              const rating = getProducerRating(producer.id);
              return (
                <Card
                  key={producer.id}
                  className="border-none shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="h-20 bg-gradient-to-r from-primary/20 to-secondary/20" />
                  <CardContent className="p-6 relative -mt-10">
                    <Avatar className="w-16 h-16 border-4 border-background mb-4">
                      <AvatarImage src={producer.profile_image} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {producer.name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="mb-3">
                      <h3 className="text-lg font-semibold">{producer.name}</h3>
                      {rating.count > 0 ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.round(rating.avg)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {rating.avg.toFixed(1)} ({rating.count})
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No ratings yet</p>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {producer.bio || "No bio provided"}
                    </p>

                    {producer.producer_skills && producer.producer_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {producer.producer_skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill.replace(/_/g, " ")}
                          </Badge>
                        ))}
                        {producer.producer_skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{producer.producer_skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-3 py-4 border-t border-b text-center text-sm mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Rate</p>
                        <p className="font-semibold text-green-600">
                          ${producer.pricing_matrix?.produced_and_mixed?.rate_per_hour || producer.production_rate_per_hour || 0}/hr
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Turnaround</p>
                        <p className="font-semibold">{producer.turnaround_time_days}d</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <Badge className={`text-xs ${producer.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                          {producer.is_available ? "Available" : "Busy"}
                        </Badge>
                      </div>
                    </div>

                    <Button className="w-full btn-gradient" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {filteredProducers.length} of {producers.length} producer{producers.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
