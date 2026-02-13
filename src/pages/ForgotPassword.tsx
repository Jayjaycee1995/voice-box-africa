import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic2, Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post('/forgot-password', { email });
      // For development, capture the token
      if (response.data.dev_token) {
        setDevToken(response.data.dev_token);
      }
      setIsSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "Please check your email for the reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send reset link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Mic2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Reset Password
            </h1>
            <p className="text-muted-foreground">
              {isSubmitted
                ? "Check your email for reset instructions"
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card">
            {isSubmitted ? (
              <div className="text-center space-y-6 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Email Sent!</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to{" "}
                    <span className="font-medium text-foreground">{email}</span>.
                    Please check your inbox.
                  </p>
                </div>
                
                {/* DEV ONLY: Show token link */}
                {devToken && (
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg text-sm">
                    <p className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Development Mode:</p>
                    <p className="mb-2">Since email is not configured, click here to reset:</p>
                    <Link 
                      to={`/reset-password?token=${devToken}&email=${email}`}
                      className="text-primary underline font-medium break-all"
                    >
                      Reset Password Link
                    </Link>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>Didn't receive the email?</p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-primary hover:underline font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button variant="hero" size="lg" className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}

            {/* Back to Login Link */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
