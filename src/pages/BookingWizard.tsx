import { useState, useEffect } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Upload,
  Calendar,
  DollarSign,
  CheckCircle2,
  Zap,
} from "lucide-react";

const steps = [
  { id: 1, name: "Project Details", icon: FileText },
  { id: 2, name: "Script", icon: Upload },
  { id: 3, name: "Deadline", icon: Calendar },
  { id: 4, name: "Review", icon: DollarSign },
];

const usageRights = [
  { id: "social", label: "Social Media" },
  { id: "radio", label: "Radio" },
  { id: "tv", label: "Television" },
  { id: "web", label: "Web/Online" },
  { id: "corporate", label: "Corporate/Internal" },
  { id: "broadcast", label: "Broadcast" },
];

const BookingWizard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to book talent.",
      });
      navigate("/login", { state: { from: `${location.pathname}${location.search}`, role: "client" } });
    }
  }, [isAuthenticated, location.pathname, location.search, navigate, toast]);

  const [formData, setFormData] = useState({
    projectName: "",
    usageRights: [] as string[],
    scriptText: "",
    instructions: "",
    deadline: "",
    rushDelivery: false,
  });

  const pricePerWord = 0.15;
  const wordCount = formData.scriptText.trim().split(/\s+/).filter(Boolean).length;
  const basePrice = wordCount * pricePerWord;
  const rushFee = formData.rushDelivery ? basePrice * 0.5 : 0;
  const totalPrice = basePrice + rushFee;

  const handleUsageRightToggle = (rightId: string) => {
    setFormData((prev) => ({
      ...prev,
      usageRights: prev.usageRights.includes(rightId)
        ? prev.usageRights.filter((r) => r !== rightId)
        : [...prev.usageRights, rightId],
    }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="pt-20 md:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Link */}
          <Link
            to={`/artists/${id}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to profile
          </Link>

          {/* Progress Steps */}
          <div className="bg-card rounded-2xl p-6 mb-6 shadow-card">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        currentStep >= step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 hidden md:block ${
                        currentStep >= step.id ? "text-primary font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 md:w-24 h-0.5 mx-2 ${
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card">
                {/* Step 1: Project Details */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                        Project Details
                      </h2>
                      <p className="text-muted-foreground">
                        Tell us about your voice-over project.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="projectName">Project Name</Label>
                        <Input
                          id="projectName"
                          placeholder="e.g., Product Launch Commercial"
                          value={formData.projectName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, projectName: e.target.value }))
                          }
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Usage Rights</Label>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                          Where will this voice-over be used?
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {usageRights.map((right) => (
                            <label
                              key={right.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                formData.usageRights.includes(right.id)
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <Checkbox
                                checked={formData.usageRights.includes(right.id)}
                                onCheckedChange={() => handleUsageRightToggle(right.id)}
                              />
                              <span className="text-sm">{right.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Script */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                        Your Script
                      </h2>
                      <p className="text-muted-foreground">
                        Paste your script or upload a file. Word count determines pricing.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="script">Script Text</Label>
                        <Textarea
                          id="script"
                          placeholder="Paste your script here..."
                          value={formData.scriptText}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, scriptText: e.target.value }))
                          }
                          className="mt-2 min-h-[200px]"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-muted-foreground">
                            Word count: <span className="font-medium text-foreground">{wordCount}</span>
                          </span>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Upload className="w-4 h-4" />
                            Upload File
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                        <Textarea
                          id="instructions"
                          placeholder="Pronunciation guides, tone preferences, specific emphasis..."
                          value={formData.instructions}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, instructions: e.target.value }))
                          }
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Deadline */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                        Delivery Timeline
                      </h2>
                      <p className="text-muted-foreground">
                        When do you need the voice-over delivered?
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input
                          id="deadline"
                          type="date"
                          value={formData.deadline}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                          }
                          className="mt-2"
                        />
                      </div>

                      <label
                        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          formData.rushDelivery
                            ? "border-secondary bg-secondary/5"
                            : "border-border hover:border-secondary/50"
                        }`}
                      >
                        <Checkbox
                          checked={formData.rushDelivery}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({ ...prev, rushDelivery: checked as boolean }))
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-secondary" />
                            <span className="font-medium text-foreground">Rush Delivery</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">
                              +50%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Get your voice-over within 24 hours (subject to artist availability)
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                        Review Your Order
                      </h2>
                      <p className="text-muted-foreground">
                        Confirm your project details before proceeding to payment.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <h4 className="font-medium text-foreground mb-3">Project Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Project Name</span>
                            <span className="text-foreground">{formData.projectName || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Usage Rights</span>
                            <span className="text-foreground">
                              {formData.usageRights.length > 0
                                ? formData.usageRights
                                    .map((r) => usageRights.find((u) => u.id === r)?.label)
                                    .join(", ")
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Word Count</span>
                            <span className="text-foreground">{wordCount} words</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Deadline</span>
                            <span className="text-foreground">{formData.deadline || "—"}</span>
                          </div>
                          {formData.rushDelivery && (
                            <div className="flex justify-between text-secondary">
                              <span>Rush Delivery</span>
                              <span>Yes (+50%)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  {currentStep > 1 ? (
                    <Button variant="outline" onClick={prevStep} className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 4 ? (
                    <Button variant="default" onClick={nextStep} className="gap-2">
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button variant="hero" className="gap-2">
                      Proceed to Payment
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-2xl p-6 shadow-card">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {wordCount} words × ${pricePerWord.toFixed(2)}
                    </span>
                    <span className="text-foreground">${basePrice.toFixed(2)}</span>
                  </div>
                  {formData.rushDelivery && (
                    <div className="flex justify-between text-sm text-secondary">
                      <span>Rush delivery fee</span>
                      <span>+${rushFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-foreground">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Funds held in escrow until you approve the delivery
                  </p>
                </div>

                {/* Payment Methods */}
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Secure payment via</p>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-xs font-medium">Paystack</span>
                    <span className="text-xs font-medium">Flutterwave</span>
                    <span className="text-xs font-medium">Stripe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingWizard;
