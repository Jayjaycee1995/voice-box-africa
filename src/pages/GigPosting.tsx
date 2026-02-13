import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, FileText, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { africanLanguages } from "@/constants/languages";
import { useAuthStore } from "@/store/useAuthStore";

const gigFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  budget: z.number().min(5, "Minimum budget is $5"),
  deadline: z.date({ required_error: "Deadline is required" }),
  language: z.string().min(1, "Language is required"),
  accent: z.string().optional(),
  tone: z.string().optional(),
  visibility: z.enum(["public", "invite-only"]),
  usageRights: z.array(z.string()).optional(),
  scriptText: z.string().optional(),
});

type GigFormValues = z.infer<typeof gigFormSchema>;

export default function GigPosting() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomLang, setIsCustomLang] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const form = useForm<GigFormValues>({
    resolver: zodResolver(gigFormSchema),
    defaultValues: {
      title: "",
      description: "",
      language: "",
      accent: "",
      tone: "",
      visibility: "public",
      usageRights: [],
      budget: 0,
      deadline: undefined,
    },
  });

  const deadline = form.watch("deadline");

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to post a project.",
      });
      navigate("/login");
      return;
    }

    if (user?.role !== 'client') {
      toast({
        title: "Access denied",
        description: "Only clients can post projects.",
        variant: "destructive"
      });
      navigate("/talent-dashboard");
      return;
    }
  }, [isAuthenticated, user, navigate, toast]);

  const onSubmit = async (data: GigFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        title: data.title,
        description: data.description + (data.scriptText ? `\n\nScript Snippet:\n${data.scriptText}` : ""),
        budget: data.budget || 0,
        deadline: format(data.deadline, "yyyy-MM-dd"),
        language: data.language,
        accent: data.accent,
        tone: data.tone,
        visibility: data.visibility,
        category: "Voice Over",
      };

      await api.post('/gigs', payload);
      
      toast({
        title: "Success",
        description: "Gig posted successfully!",
      });
      
      navigate('/client-dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to post gig.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    // Validate current step fields before moving
    let fieldsToValidate: (keyof GigFormValues)[] = [];
    if (step === 1) fieldsToValidate = ['title', 'language', 'accent', 'tone'];
    if (step === 2) fieldsToValidate = ['description', 'scriptText'];
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <DashboardHeader />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-3xl bg-card rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[600px]">
          {/* Left Side - Progress (Desktop) */}
          <div className="hidden md:flex w-1/3 bg-navy text-white p-8 flex-col justify-between relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-navy z-0" />
             <div className="z-10 relative">
               <h2 className="text-2xl font-bold font-heading mb-6">Post a Job</h2>
               <div className="space-y-6">
                 {[1, 2, 3].map((s) => (
                   <div key={s} className={`flex items-center gap-3 transition-all duration-300 ${step === s ? "opacity-100 translate-x-2" : "opacity-60"}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= s ? "bg-primary border-primary text-white" : "border-white/30 text-white/50"}`}>
                       {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                     </div>
                     <span className="font-medium">
                       {s === 1 && "Project Basics"}
                       {s === 2 && "Details & Script"}
                       {s === 3 && "Budget & Review"}
                     </span>
                   </div>
                 ))}
               </div>
             </div>
             
             {/* Animated Progress Bar (Bottom) */}
             <div className="w-full h-2 bg-white/10 rounded-full mt-auto relative overflow-hidden">
               <div 
                 className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                 style={{ width: `${(step / 3) * 100}%` }}
               />
             </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 flex flex-col w-full relative">
            {/* Mobile Progress Bar */}
            <div className="md:hidden h-2 bg-muted w-full">
               <div 
                 className="h-full bg-primary transition-all duration-300"
                 style={{ width: `${(step / 3) * 100}%` }}
               />
            </div>

            <ScrollArea className="flex-1 p-6 md:p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
                
                {step === 1 && (
                  <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Project Basics</h3>
                      <p className="text-sm text-muted-foreground">Let's start with the core details.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project Title</label>
                      <Input {...form.register("title")} placeholder="e.g. 30s Radio Commercial" />
                      {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Language</label>
                        {!isCustomLang ? (
                          <Select 
                            onValueChange={(val) => {
                              if (val === "other") {
                                setIsCustomLang(true);
                                form.setValue("language", "");
                              } else {
                                form.setValue("language", val);
                              }
                            }} 
                            defaultValue={form.getValues("language")}
                          >
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {africanLanguages.map(lang => (
                                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                              ))}
                              <SelectItem value="other">Other (Type custom)</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Enter language..." 
                              {...form.register("language")}
                              autoFocus
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                setIsCustomLang(false);
                                form.setValue("language", "");
                              }}
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {form.formState.errors.language && <p className="text-xs text-destructive">{form.formState.errors.language.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Accent</label>
                        <Input {...form.register("accent")} placeholder="e.g. Neutral, Pidgin" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tone</label>
                      <Input {...form.register("tone")} placeholder="e.g. Energetic, Corporate, Warm" />
                    </div>
                  </div>
                )}

                {step === 2 && (
                   <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Details & Script</h3>
                      <p className="text-sm text-muted-foreground">Describe what you need.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea {...form.register("description")} placeholder="Describe the project goals, audience, and style..." className="min-h-[120px]" />
                      {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Script Snippet (Optional)</label>
                      <Textarea {...form.register("scriptText")} placeholder="Paste a sample of the script here..." className="min-h-[100px]" />
                    </div>
                  </div>
                )}

                {step === 3 && (
                   <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Budget & Timeline</h3>
                      <p className="text-sm text-muted-foreground">Finalize your job post.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Budget ($)</label>
                        <Input type="number" {...form.register("budget", { valueAsNumber: true })} placeholder="100" />
                        {form.formState.errors.budget && <p className="text-xs text-destructive">{form.formState.errors.budget.message}</p>}
                      </div>
                      
                      <div className="space-y-2 flex flex-col">
                        <label className="text-sm font-medium">Deadline</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !deadline && "text-muted-foreground")}>
                              {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={deadline}
                              onSelect={(date) => form.setValue("deadline", date as Date)}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {form.formState.errors.deadline && <p className="text-xs text-destructive">{form.formState.errors.deadline.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Visibility</label>
                      <Select onValueChange={(val) => form.setValue("visibility", val as "public" | "invite-only")} defaultValue="public">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public (Everyone can see)</SelectItem>
                          <SelectItem value="invite-only">Invite Only (Private)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </form>
            </ScrollArea>

            {/* Navigation Buttons */}
            <div className="p-6 border-t bg-background/50 backdrop-blur-sm flex justify-between items-center">
               {step > 1 ? (
                 <Button variant="ghost" onClick={prevStep} disabled={isLoading}>Back</Button>
               ) : (
                 <Button variant="ghost" onClick={() => navigate(-1)} disabled={isLoading}>Cancel</Button>
               )}
               
               {step < 3 ? (
                 <Button className="btn-gradient" onClick={nextStep}>Next <ArrowRight className="w-4 h-4 ml-2" /></Button>
               ) : (
                 <Button className="btn-gradient" onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                   {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                   Post Gig
                 </Button>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
