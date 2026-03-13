import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Clock, DollarSign, Calendar } from "lucide-react";
import { Gig } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { timeAgo } from "@/lib/utils";

const proposalFormSchema = z.object({
  bidPrice: z.number().min(1, "Bid price is required").max(100000, "Max $100,000"),
  deliveryTime: z.number().min(1, "Delivery time is required").max(365, "Max 365 days"),
  proposalText: z.string().min(50, "Min 50 characters").max(2000, "Max 2000 characters"),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

const SubmitProposal = () => {
  const { gigId } = useParams<{ gigId: string }>();
  const [gig, setGig] = useState<Gig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: { bidPrice: 0, deliveryTime: 7, proposalText: "" }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/submit-proposal/${gigId}`, role: "talent" } });
      return;
    }
    if (user?.role !== 'talent') {
      toast({ title: "Access denied", description: "Only talents can submit proposals", variant: "destructive" });
      navigate("/client-dashboard");
      return;
    }

    const fetchGig = async () => {
      try {
        const { data, error } = await supabase.from('gigs').select('*').eq('id', gigId).single();
        if (error) throw error;
        setGig(data);
        if (data?.budget) setValue("bidPrice", data.budget * 0.9);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load gig", variant: "destructive" });
        navigate('/browse-gigs');
      } finally {
        setIsLoading(false);
      }
    };
    if (gigId) fetchGig();
  }, [gigId, user?.role, isAuthenticated, navigate, toast, setValue]);

  const bidPrice = watch("bidPrice");
  const deliveryTime = watch("deliveryTime");
  const proposalText = watch("proposalText");

  const platformFee = bidPrice * 0.10;
  const youReceive = bidPrice - platformFee;

  const onSubmit = async (data: ProposalFormValues) => {
    if (!user || !gigId) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('proposals').insert({
        gig_id: Number(gigId),
        talent_id: user.id,
        bid_amount: data.bidPrice,
        cover_letter: `${data.proposalText}\n\nDelivery: ${data.deliveryTime} days`,
        status: 'pending'
      });
      
      if (error) {
        console.error("Submit error:", error);
        throw error;
      }
      
      toast({ title: "Success!", description: "Your proposal has been submitted." });
      navigate('/browse-gigs');
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to submit proposal. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (isLoading || !gig) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link to="/browse-gigs" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Browse Gigs
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Proposal</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Bid Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="bidPrice">Your Bid Amount ($)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input 
                          id="bidPrice"
                          type="number" 
                          step="0.01" 
                          {...register("bidPrice", { valueAsNumber: true })} 
                          className={`pl-8 ${errors.bidPrice ? "border-destructive" : ""}`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.bidPrice && <p className="text-sm text-destructive">{errors.bidPrice.message}</p>}
                    </div>

                    {/* Delivery Time */}
                    <div className="space-y-2">
                      <Label htmlFor="deliveryTime">Delivery Time (Days)</Label>
                      <div className="relative">
                        <Input 
                          id="deliveryTime"
                          type="number" 
                          {...register("deliveryTime", { valueAsNumber: true })} 
                          className={errors.deliveryTime ? "border-destructive" : ""}
                          placeholder="7"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">days</span>
                      </div>
                      {errors.deliveryTime && <p className="text-sm text-destructive">{errors.deliveryTime.message}</p>}
                    </div>

                    {/* Cover Letter */}
                    <div className="space-y-2">
                      <Label htmlFor="proposalText">Cover Letter</Label>
                      <Textarea 
                        id="proposalText"
                        rows={6}
                        {...register("proposalText")}
                        className={errors.proposalText ? "border-destructive" : ""}
                        placeholder="Introduce yourself and explain why you're the best fit for this project..."
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-destructive">{errors.proposalText?.message}</span>
                        <span className="text-muted-foreground">{proposalText?.length || 0}/2000</span>
                      </div>
                    </div>

                    {/* Submit */}
                    <Button 
                      type="submit" 
                      className="w-full btn-gradient"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                      ) : (
                        "Submit Proposal"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1/3 */}
            <div className="space-y-5">
              {/* Gig Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gig Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold line-clamp-2">{gig.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="font-semibold">${gig.budget}</span>
                    <span className="text-muted-foreground">budget</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {timeAgo(gig.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Deadline: {formatDate(gig.deadline)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {gig.language}
                    </span>
                    <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">
                      {gig.accent}
                    </span>
                    <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                      {gig.tone}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Earnings Calculator */}
              {bidPrice > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base">Your Earnings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your Bid</span>
                      <span>${bidPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee (10%)</span>
                      <span>-${platformFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>You'll Receive</span>
                      <span className="text-primary">${youReceive.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubmitProposal;
