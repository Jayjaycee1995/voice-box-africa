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
import { ArrowLeft, Upload, Clock, DollarSign, Loader2 } from "lucide-react";
import { Gig } from "@/lib/database.types";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

// Mock gig data removed

const proposalFormSchema = z.object({
  bidPrice: z.number().min(1, "Bid price must be at least $1").max(100000, "Bid price cannot exceed $100,000"),
  deliveryTime: z.number().min(1, "Delivery time must be at least 1 day").max(365, "Delivery time cannot exceed 1 year"),
  proposalText: z.string().min(50, "Proposal must be at least 50 characters").max(2000, "Proposal cannot exceed 2000 characters"),
  demoFile: z.instanceof(FileList).optional()
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

const SubmitProposal = () => {
  const { gigId } = useParams<{ gigId: string }>();
  const [gig, setGig] = useState<Gig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      bidPrice: 0,
      deliveryTime: 7,
      proposalText: ""
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a proposal.",
      });
      navigate("/login");
      return;
    }

    if (user?.role !== 'talent') {
      toast({
        title: "Access denied",
        description: "Only talents can submit proposals.",
        variant: "destructive"
      });
      navigate("/client-dashboard");
      return;
    }

    const fetchGig = async () => {
      try {
        const response = await api.get(`/gigs/${gigId}`);
        setGig(response.data);
        if (response.data.budget) {
          setValue("bidPrice", response.data.budget * 0.9);
        }
      } catch (error) {
        console.error("Failed to fetch gig", error);
        toast({ title: "Error", description: "Failed to load gig details", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    if (gigId) fetchGig();
  }, [gigId, setValue, toast]);

  const bidPrice = watch("bidPrice");
  const deliveryTime = watch("deliveryTime");

  const calculatePlatformFee = (price: number) => price * 0.10; // 10% platform fee
  const calculateTotal = (price: number) => price + calculatePlatformFee(price);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-m4a'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        alert('Please upload an audio file (MP3, WAV, M4A)');
        return;
      }
      
      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const onSubmit = async (data: ProposalFormValues) => {
    setIsSubmitting(true);
    
    try {
      await api.post(`/gigs/${gigId}/proposals`, {
        bid_amount: data.bidPrice,
        cover_letter: `${data.proposalText}\n\nDelivery Time: ${data.deliveryTime} days`,
        // demo_url would be uploaded separately, skipping for now
      });
      
      toast({
        title: "Success",
        description: "Proposal submitted successfully!",
      });
      
      navigate('/browse-gigs');
      
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to submit proposal. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Gig not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 md:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="gap-2">
              <Link to={`/browse-gigs`}>
                <ArrowLeft className="w-4 h-4" />
                Back to Gigs
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Gig Details */}
            <div className="card-elevated p-6 rounded-xl">
              <h2 className="font-semibold text-xl text-foreground mb-4">
                Gig Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {gig.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {gig.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Language:</span>
                    <div className="font-medium text-foreground">
                      {gig.language}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accent:</span>
                    <div className="font-medium text-foreground">
                      {gig.accent}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tone:</span>
                    <div className="font-medium text-foreground">
                      {gig.tone}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Budget:</span>
                    <div className="font-medium text-foreground">
                      {gig.budget ? `$${gig.budget}` : 'Not specified'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Deadline: {new Date(gig.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Proposal Form */}
            <div className="card-elevated p-6 rounded-xl">
              <h2 className="font-semibold text-xl text-foreground mb-6">
                Submit Proposal
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Bid Price */}
                <div className="space-y-2">
                  <Label htmlFor="bidPrice">Your Bid Price ($)</Label>
                  <Input
                    id="bidPrice"
                    type="number"
                    step="0.01"
                    {...register("bidPrice", { valueAsNumber: true })}
                    className={errors.bidPrice ? "border-destructive" : ""}
                  />
                  {errors.bidPrice && (
                    <p className="text-sm text-destructive">
                      {errors.bidPrice.message}
                    </p>
                  )}
                </div>

                {/* Delivery Time */}
                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Delivery Time (Days)</Label>
                  <Input
                    id="deliveryTime"
                    type="number"
                    {...register("deliveryTime", { valueAsNumber: true })}
                    className={errors.deliveryTime ? "border-destructive" : ""}
                  />
                  {errors.deliveryTime && (
                    <p className="text-sm text-destructive">
                      {errors.deliveryTime.message}
                    </p>
                  )}
                </div>

                {/* Proposal Text */}
                <div className="space-y-2">
                  <Label htmlFor="proposalText">Proposal Message</Label>
                  <Textarea
                    id="proposalText"
                    rows={5}
                    placeholder="Explain why you're the perfect fit for this project. Include your experience, approach, and any relevant samples..."
                    {...register("proposalText")}
                    className={errors.proposalText ? "border-destructive" : ""}
                  />
                  {errors.proposalText && (
                    <p className="text-sm text-destructive">
                      {errors.proposalText.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {watch("proposalText")?.length || 0}/2000 characters
                  </p>
                </div>

                {/* Demo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="demoFile">Demo Audio (Optional)</Label>
                  <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <input
                      id="demoFile"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="demoFile" className="cursor-pointer">
                      <span className="text-sm font-medium text-primary">
                        {selectedFile ? selectedFile.name : 'Click to upload demo'}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        MP3, WAV, or M4A files up to 10MB
                      </p>
                    </label>
                  </div>
                </div>

                {/* Pricing Summary */}
                {bidPrice > 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Your Bid:</span>
                      <span className="font-semibold">${bidPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Platform Fee (10%):</span>
                      <span className="font-semibold">
                        ${calculatePlatformFee(bidPrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>Client Pays:</span>
                      <span>${calculateTotal(bidPrice).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Platform fee covers payment processing and escrow services
                    </p>
                  </div>
                )}

                {/* Delivery Timeline */}
                {deliveryTime > 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>
                        You'll deliver in {deliveryTime} day{deliveryTime !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full btn-gradient"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting Proposal...' : 'Submit Proposal'}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  By submitting, you agree to our terms and confirm this proposal is accurate
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubmitProposal;