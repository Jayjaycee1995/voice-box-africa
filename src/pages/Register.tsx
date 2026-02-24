import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Mic2,
  User,
  Mail,
  Lock,
  Building2,
  Globe,
  Upload,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Briefcase,
  ChevronLeft,
  X
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import voiboxLogo from "@/assets/voibox-logo.png";
import { africanLanguages } from "@/constants/languages";
import { ScrollArea } from "@/components/ui/scroll-area";

type UserType = "client" | "talent";

const specialties = [
  "Commercial", "Documentary", "E-learning", "Corporate",
  "Animation", "Audiobook", "Gaming", "Promo", "Podcast", "IVR/Phone"
];

const Register = () => {
  const [userType, setUserType] = useState<UserType>("client");
  const { register } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Cancel any pending redirect if the component unmounts before the timer fires
  useEffect(() => () => clearTimeout(redirectTimerRef.current), []);
  const [step, setStep] = useState(1);
  const [customLanguage, setCustomLanguage] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    industry: "",
    displayName: "",
    location: "",
    bio: "",
    languages: [] as string[],
    specialties: [] as string[],
    pricePerWord: "",
    equipment: "",
    agreeToTerms: false,
  });

  const handleLanguageToggle = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleSpecialtyToggle = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(spec)
        ? prev.specialties.filter((s) => s !== spec)
        : [...prev.specialties, spec],
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const name = userType === 'talent' ? formData.displayName : formData.fullName;
      const role = userType;
      
      const metadata = {
        bio: userType === 'talent' ? formData.bio : (formData.companyName ? `Company: ${formData.companyName}` : null),
        skills: userType === 'talent' ? JSON.stringify([...formData.languages, ...formData.specialties]) : null,
        company_name: formData.companyName,
        industry: formData.industry,
        location: formData.location,
        price_per_word: formData.pricePerWord,
        equipment: formData.equipment,
      };

      await register(formData.email, formData.password, name, role, metadata);
      
      toast({
        title: "Registration successful!",
        description: "Welcome! You can now sign in to your account.",
      });

      const from = typeof (location.state as { from?: unknown } | null)?.from === "string"
        ? (location.state as { from?: string }).from
        : null;

      // Small delay so the user sees the success toast before being redirected.
      // The ref lets us cancel this if the component unmounts first.
      redirectTimerRef.current = setTimeout(() => {
        navigate("/login", { state: { from, role: userType } });
      }, 1500);
      
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong.";
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-navy relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-navy z-0" />
        <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-12">
             <img 
               src={voiboxLogo} 
               alt="Voibox" 
               className="h-8 transition-all duration-300 hover:scale-105" 
             />
          </Link>
          
          <h1 className="text-5xl font-heading font-bold leading-tight mb-6">
            Discover the <br/>
            <span className="text-secondary">Authentic Voice</span> <br/>
            of Africa.
          </h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            Join thousands of creators and voice talents building the future of African storytelling.
          </p>
        </div>

        <div className="relative z-10 flex gap-8 items-end">
           <div className="space-y-2">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm opacity-70">Verified Talents</div>
           </div>
           <div className="space-y-2">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm opacity-70">Languages</div>
           </div>
           <div className="space-y-2">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm opacity-70">Client Satisfaction</div>
           </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen">
        <div className="p-6 border-b flex justify-between items-center bg-background/50 backdrop-blur-sm z-20">
           <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-primary">
             <Link to="/"><ChevronLeft className="w-4 h-4" /> Back to Home</Link>
           </Button>
        </div>

        <ScrollArea className="flex-1 p-4 md:p-12 pb-safe md:pb-0">
          <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold font-heading">Create an account</h2>
              <p className="text-muted-foreground">Choose your account type to get started</p>
            </div>

            {/* User Type Toggle */}
            <div className="grid grid-cols-2 gap-4 p-1 bg-muted rounded-xl">
              <button
                onClick={() => { setUserType("client"); setStep(1); }}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  userType === "client" 
                    ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                I'm a Client
              </button>
              <button
                onClick={() => { setUserType("talent"); setStep(1); }}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  userType === "talent" 
                    ? "bg-secondary/10 text-secondary shadow-sm ring-1 ring-secondary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Mic2 className="w-4 h-4" />
                I'm a Talent
              </button>
            </div>

            {/* Client Form */}
            {userType === "client" && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="John Doe" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company (Optional)</Label>
                    <Input placeholder="Acme Inc." value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <PasswordInput placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <PasswordInput placeholder="••••••••" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox id="terms" checked={formData.agreeToTerms} onCheckedChange={(c) => setFormData({...formData, agreeToTerms: c as boolean})} />
                  <label htmlFor="terms" className="text-xs text-muted-foreground">
                    I agree to the <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </label>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 mt-2" size="lg" onClick={handleSubmit} disabled={isLoading || !formData.agreeToTerms}>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Create Account
                </Button>

                <p className="text-sm text-muted-foreground text-center lg:hidden mt-4">
                  Already have an account? <Link to="/login" state={{ from: (location.state as { from?: unknown } | null)?.from ?? null, role: userType }} className="text-primary font-medium hover:underline">Sign in</Link>
                </p>
              </div>
            )}

            {/* Talent Form Steps */}
            {userType === "talent" && (
              <div className="space-y-6">
                {/* Step Indicators */}
                <div className="flex justify-between items-center px-2">
                   {[1, 2, 3].map(s => (
                     <div key={s} className={`h-1 flex-1 mx-1 rounded-full transition-all duration-500 ${step >= s ? "bg-primary" : "bg-muted"}`} />
                   ))}
                </div>

                {step === 1 && (
                  <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input placeholder="Amara O." value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" placeholder="amara@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <PasswordInput value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm</Label>
                        <PasswordInput value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => setStep(2)}>Continue</Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea placeholder="Tell us about your voice..." className="min-h-[100px]" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Languages</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                        {africanLanguages.map(lang => (
                          <div key={lang} className="flex items-center gap-2">
                            <Checkbox checked={formData.languages.includes(lang)} onCheckedChange={() => handleLanguageToggle(lang)} />
                            <span className="text-sm">{lang}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                         <Input 
                           placeholder="Add another language..." 
                           value={customLanguage}
                           onChange={(e) => setCustomLanguage(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               e.preventDefault();
                               if (customLanguage.trim() && !formData.languages.includes(customLanguage.trim())) {
                                 handleLanguageToggle(customLanguage.trim());
                                 setCustomLanguage("");
                               }
                             }
                           }}
                         />
                         <Button 
                           type="button" 
                           variant="outline" 
                           onClick={() => {
                             if (customLanguage.trim() && !formData.languages.includes(customLanguage.trim())) {
                               handleLanguageToggle(customLanguage.trim());
                               setCustomLanguage("");
                             }
                           }}
                         >
                           Add
                         </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.languages.filter(l => !africanLanguages.includes(l)).map(l => (
                          <Badge key={l} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                            {l}
                            <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleLanguageToggle(l)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                      <Button className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => setStep(3)}>Continue</Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                    <div className="space-y-2">
                      <Label>Specialties</Label>
                      <div className="flex flex-wrap gap-2">
                        {specialties.map(spec => (
                          <span 
                            key={spec} 
                            onClick={() => handleSpecialtyToggle(spec)}
                            className={`text-xs px-2 py-1 rounded-full cursor-pointer transition-colors ${formData.specialties.includes(spec) ? "bg-secondary text-secondary-foreground" : "bg-muted hover:bg-muted/80"}`}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Rate per word ($)</Label>
                      <Input type="number" step="0.01" placeholder="0.15" value={formData.pricePerWord} onChange={e => setFormData({...formData, pricePerWord: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Checkbox checked={formData.agreeToTerms} onCheckedChange={(c) => setFormData({...formData, agreeToTerms: c as boolean})} />
                      <label className="text-xs text-muted-foreground">I agree to the Terms & Conditions</label>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                      <Button className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={handleSubmit} disabled={isLoading || !formData.agreeToTerms}>
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Complete
                      </Button>
                    </div>
                  </div>
                )}

                <p className="text-sm text-muted-foreground text-center lg:hidden mt-6">
                  Already have an account? <Link to="/login" state={{ from: (location.state as { from?: unknown } | null)?.from ?? null, role: userType }} className="text-primary font-medium hover:underline">Sign in</Link>
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Register;
