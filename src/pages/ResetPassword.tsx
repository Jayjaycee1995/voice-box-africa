import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Mic2, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if session exists (user clicked magic link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // If no session, maybe check hash fragment manually or just warn
        // Supabase client usually parses hash on load.
        // But if we navigate here directly without hash, session is null.
        // We'll give it a moment or just warn.
        // Actually, on mount, session might not be ready if `initialize` hasn't finished.
        // But `App.tsx` calls `initialize`.
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 8) {
        toast({
          title: "Error",
          description: "Password must be at least 8 characters.",
          variant: "destructive",
        });
        return;
      }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast({
        title: "Success",
        description: "Your password has been reset successfully. Redirecting to login...",
      });
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password.";
      toast({
        title: "Error",
        description: errorMessage,
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
              Set New Password
            </h1>
            <p className="text-muted-foreground">
              {isSuccess
                ? "Your password has been updated"
                : "Create a new secure password for your account"}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card">
            {isSuccess ? (
              <div className="text-center space-y-6 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Password Reset Complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    You can now sign in with your new password.
                  </p>
                </div>
                <Button 
                    className="w-full" 
                    variant="hero"
                    onClick={() => navigate('/login')}
                >
                    Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <Button variant="hero" size="lg" className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}

            {/* Back to Login Link */}
            {!isSuccess && (
                <div className="mt-6 pt-6 border-t border-border text-center">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to sign in
                </Link>
                </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
