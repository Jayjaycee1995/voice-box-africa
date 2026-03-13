import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { User, ProductionAssignmentType, ServiceType } from "@/lib/database.types";
import { Star, Search, Filter } from "lucide-react";

interface ProducerSelectorProps {
  assignmentType: ProductionAssignmentType;
  serviceType?: ServiceType;
  selectedProducerId?: string;
  onSelect: (producer: User) => void;
  budget?: number;
}

export default function ProducerSelector({
  assignmentType,
  serviceType,
  selectedProducerId,
  onSelect,
  budget = 0,
}: ProducerSelectorProps) {
  const [producers, setProducers] = useState<User[]>([]);
  const [filteredProducers, setFilteredProducers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducer, setSelectedProducer] = useState<User | undefined>();

  useEffect(() => {
    const fetchProducers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("is_official_producer", true)
          .eq("is_available", true)
          .order("name");

        if (error) throw error;
        setProducers(data || []);
        setFilteredProducers(data || []);

        // If a producer was pre-selected, find them
        if (selectedProducerId) {
          const selected = data?.find((p) => p.id === selectedProducerId);
          if (selected) setSelectedProducer(selected);
        }
      } catch (error) {
        console.error("Error fetching producers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducers();
  }, [selectedProducerId]);

  useEffect(() => {
    const filtered = producers.filter((producer) => {
      const matchesSearch =
        producer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producer.bio?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by produced skills if applicable
      const producerSkills = producer.producer_skills || [];
      const matchesSkills =
        assignmentType === "full_production" ||
        producerSkills.includes(assignmentType);

      return matchesSearch && matchesSkills;
    });

    setFilteredProducers(filtered);
  }, [searchTerm, producers, assignmentType]);

  const handleSelectProducer = (producer: User) => {
    setSelectedProducer(producer);
    onSelect(producer);
  };

  const getProducerRate = (producer: User): number => {
    if (serviceType && producer.pricing_matrix?.[serviceType]) {
      return producer.pricing_matrix[serviceType].rate_per_hour || 0;
    }
    return producer.production_rate_per_hour || 0;
  };

  const estimatedCost =
    selectedProducer && selectedProducer.turnaround_time_days
      ? getProducerRate(selectedProducer) * 8 * (selectedProducer.turnaround_time_days || 1)
      : 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select a Producer</h3>
        <p className="text-sm text-muted-foreground">
          Choose a producer specialized in {assignmentType.replace(/_/g, " ")}.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search producers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Producers Grid */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : filteredProducers.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-2">No producers found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {filteredProducers.map((producer) => {
              const isSelected = selectedProducer?.id === producer.id;
              const rate = getProducerRate(producer);

              return (
                <Card
                  key={producer.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "ring-2 ring-primary shadow-md border-primary"
                      : "hover:shadow-md border-border/50"
                  }`}
                  onClick={() => handleSelectProducer(producer)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={producer.profile_image} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {producer.name?.charAt(0) || "P"}
                        </AvatarFallback>
                      </Avatar>

                      {/* Producer Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-semibold truncate">{producer.name}</p>
                            <p className="text-xs text-muted-foreground">Producer</p>
                          </div>
                          {isSelected && (
                            <Badge className="flex-shrink-0">Selected</Badge>
                          )}
                        </div>

                        {/* Bio/Skills */}
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                          {producer.bio || "No bio provided"}
                        </p>

                        {/* Skills */}
                        {producer.producer_skills && producer.producer_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {producer.producer_skills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Rate & Turnaround */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Rate</p>
                              <p className="font-semibold text-green-600">
                                ${rate}/hour
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Turnaround</p>
                              <p className="font-semibold">
                                {producer.turnaround_time_days} days
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Selected Producer Summary */}
      {selectedProducer && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary mb-2">Producer Selected</p>
                <p className="text-sm text-foreground">{selectedProducer.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Est. Cost</p>
                <p className="text-lg font-semibold text-green-600">
                  ${estimatedCost.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total available: ${budget.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
