import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, MapPin, DollarSign, Calendar, Mic, FileText, ArrowLeft, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Gig } from "@/lib/database.types";
import { useToast } from "@/hooks/use-toast";
import { timeAgo } from "@/lib/utils";

const GigDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const [gig, setGig] = useState<Gig | null>(null);
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProposed, setHasProposed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchGigDetails = async () => {
      if (!id) return;
      
      try {
        // Fetch gig details
        const { data: gigData, error: gigError } = await supabase
          .from('gigs')
          .select('*')
          .eq('id', id)
          .single();

        if (gigError) throw gigError;
        setGig(gigData);

        // Fetch client info
        if (gigData?.client_id) {
          const { data: clientData, error: clientError } = await supabase
            .from('users')
            .select('id, name, email, profile_image, created_at')
            .eq('id', gigData.client_id)
            .single();

          if (!clientError) {
            setClient(clientData);
          }
        }

        // Check if user has already proposed
        if (isAuthenticated && user?.id) {
          const { data: proposalData } = await supabase
            .from('proposals')
            .select('id')
            .eq('gig_id', id)
            .eq('talent_id', user.id)
            .single();

          if (proposalData) {
            setHasProposed(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch gig details:", error);
        toast({
          title: "Error",
          description: "Failed to load gig details",
          variant: "destructive",
        });
        navigate('/browse-gigs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGigDetails();
  }, [id, user, isAuthenticated, navigate, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDeadline = (dateString: string) => {
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `${diffDays} days left`;
    return formatDate(dateString);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Gig Not Found</h2>
            <Button asChild>
              <Link to="/browse-gigs">Back to Browse Gigs</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/browse-gigs" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Browse Gigs
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Status */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      {gig.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={gig.status === 'open' ? 'default' : 'secondary'}>
                        {gig.status}
                      </Badge>
                      {gig.visibility === 'invite-only' && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Invite Only
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl md:text-3xl font-bold text-primary">
                      ${gig.budget}
                    </div>
                    <div className="text-sm text-muted-foreground">Budget</div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{formatDeadline(gig.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {timeAgo(gig.created_at)}</span>
                  </div>
                  {gig.duration && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mic className="w-4 h-4" />
                      <span>{gig.duration}</span>
                    </div>
                  )}
                  {gig.word_count && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{gig.word_count} words</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    {gig.language}
                  </span>
                  <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">
                    {gig.accent} accent
                  </span>
                  <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                    {gig.tone} tone
                  </span>
                  {gig.category && (
                    <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                      {gig.category}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-lg font-semibold mb-3">Project Description</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                    {gig.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">About the Client</h3>
                {client ? (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {client.profile_image ? (
                        <img 
                          src={client.profile_image} 
                          alt={client.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-bold text-lg">
                          {client.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Member since {formatDate(client.created_at)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm mb-4">
                    Client information unavailable
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                {hasProposed ? (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Proposal Submitted</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You have already submitted a proposal for this gig. The client will review and get back to you.
                    </p>
                  </div>
                ) : gig.status === 'open' ? (
                  <>
                    <h3 className="font-semibold mb-4">Interested in this project?</h3>
                    <Button className="w-full btn-gradient mb-3" asChild>
                      <Link to={`/submit-proposal/${gig.id}`}>
                        Submit Proposal
                      </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Click to submit your best proposal with your rate and demo
                    </p>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <X className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">This Gig is Closed</h3>
                    <p className="text-sm text-muted-foreground">
                      This project is no longer accepting proposals
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GigDetails;
