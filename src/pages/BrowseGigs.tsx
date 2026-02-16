import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X, Clock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Gig } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

const languages = [
  "All Languages",
  "English (Nigerian)",
  "English (Kenyan)",
  "English (South African)",
  "Swahili",
  "Yoruba",
  "Hausa",
  "Zulu",
  "Arabic"
];

const tones = [
  "All Tones",
  "Commercial",
  "Educational",
  "Storytelling",
  "Professional",
  "Conversational",
  "Authoritative"
];

const budgetRanges = [
  { label: "All Budgets", min: 0, max: Infinity },
  { label: "Under $500", min: 0, max: 500 },
  { label: "$500 - $1000", min: 500, max: 1000 },
  { label: "$1000 - $2000", min: 1000, max: 2000 },
  { label: "Over $2000", min: 2000, max: Infinity }
];

const BrowseGigs = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");
  const [selectedTone, setSelectedTone] = useState("All Tones");
  const [selectedBudgetRange, setSelectedBudgetRange] = useState(0);
  const [showPublicOnly, setShowPublicOnly] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchGigs = async () => {
      try {
        const { data: publicGigs, error } = await supabase
          .from('gigs')
          .select('*')
          .eq('status', 'open')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (isMounted) {
          setGigs((publicGigs as unknown as Gig[]) ?? []);
        }

        if (user?.role !== "talent") return;

        const { data: invitations, error: invError } = await supabase
          .from("invitations")
          .select(`
            gig:gigs(*)
          `)
          .eq("talent_id", user.id);

        if (invError) throw invError;

        const invitedGigs = (invitations as unknown as Array<{ gig?: Gig | null }> | null)
          ?.map((i) => i.gig)
          .filter((g): g is Gig => Boolean(g))
          .filter((g) => g.status === "open") ?? [];

        if (isMounted && invitedGigs.length > 0) {
          setGigs((prev) => {
            const byId = new Map(prev.map((g) => [g.id, g]));
            invitedGigs.forEach((g) => byId.set(g.id, g));
            return Array.from(byId.values()).sort((a, b) => {
              const aTime = new Date(a.created_at).getTime();
              const bTime = new Date(b.created_at).getTime();
              return bTime - aTime;
            });
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch gigs", error);
          const errorMessage = error instanceof Error ? error.message : "Failed to load gigs.";
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchGigs();
    return () => {
      isMounted = false;
    };
  }, [toast, user?.id, user?.role]);

  const filteredGigs = gigs.filter((gig) => {
    const matchesSearch =
      searchQuery === "" ||
      gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage =
      selectedLanguage === "All Languages" ||
      gig.language.toLowerCase().includes(selectedLanguage.toLowerCase());

    const matchesTone =
      selectedTone === "All Tones" ||
      gig.tone.toLowerCase().includes(selectedTone.toLowerCase());

    const budgetRange = budgetRanges[selectedBudgetRange];
    const budget = gig.budget || 0;
    const matchesBudget = budget >= budgetRange.min && budget <= budgetRange.max;

    const matchesVisibility = !showPublicOnly || gig.visibility === "public";

    return matchesSearch && matchesLanguage && matchesTone && matchesBudget && matchesVisibility;
  });

  const formatDeadline = (dateString: string) => {
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days left`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 md:pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Browse Voice Over Gigs
            </h1>
            <p className="text-muted-foreground">
              {filteredGigs.length} gigs available
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
                  placeholder="Search gigs by title, description..."
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
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="h-12 px-4 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 text-foreground"
                >
                  {tones.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBudgetRange}
                  onChange={(e) => setSelectedBudgetRange(Number(e.target.value))}
                  className="h-12 px-4 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 text-foreground"
                >
                  {budgetRanges.map((range, index) => (
                    <option key={range.label} value={index}>
                      {range.label}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2 px-4 h-12 border border-input rounded-lg cursor-pointer hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={showPublicOnly}
                    onChange={(e) => setShowPublicOnly(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Public only</span>
                </label>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="md:hidden mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full h-12 px-4 bg-background border border-input rounded-lg"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="w-full h-12 px-4 bg-background border border-input rounded-lg"
                >
                  {tones.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBudgetRange}
                  onChange={(e) => setSelectedBudgetRange(Number(e.target.value))}
                  className="w-full h-12 px-4 bg-background border border-input rounded-lg"
                >
                  {budgetRanges.map((range, index) => (
                    <option key={range.label} value={index}>
                      {range.label}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showPublicOnly}
                    onChange={(e) => setShowPublicOnly(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Public gigs only</span>
                </label>
              </div>
            )}
          </div>

          {/* Gig List */}
          <div className="grid gap-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {filteredGigs.map((gig, index) => (
                  <div
                    key={gig.id}
                    className="card-elevated p-6 rounded-xl animate-slide-up"
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-xl text-foreground">
                            {gig.title}
                          </h3>
                          {gig.visibility === "invite-only" && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                              <EyeOff className="w-3 h-3" />
                              Invite Only
                            </span>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {gig.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                            {gig.language}
                          </span>
                          <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full">
                            {gig.accent} accent
                          </span>
                          <span className="bg-accent/10 text-accent px-3 py-1 rounded-full">
                            {gig.tone} tone
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {gig.budget && (
                            <span className="font-semibold text-foreground">
                              ${gig.budget}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {formatDeadline(gig.deadline)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {(!isAuthenticated || user?.role === 'talent') && (
                          <Button 
                            className="btn-gradient" 
                            asChild
                          >
                            <Link to={`/submit-proposal/${gig.id}`}>
                              Submit Proposal
                            </Link>
                          </Button>
                        )}
                        <Button variant="outline" asChild>
                          <Link to={`/gig/${gig.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredGigs.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                      No gigs found matching your criteria
                    </div>
                    <Button variant="outline" onClick={() => {
                      setSearchQuery("");
                      setSelectedLanguage("All Languages");
                      setSelectedTone("All Tones");
                      setSelectedBudgetRange(0);
                      setShowPublicOnly(true);
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrowseGigs;
