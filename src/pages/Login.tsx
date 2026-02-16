import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { ArrowRight, Loader2, Check } from "lucide-react";
import voiboxLogo from "@/assets/voibox-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'client' | 'talent'>('client');
  const [formData, setFormData] = useState({
    email: localStorage.getItem('rememberedEmail') || "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('rememberedEmail'));

  const from = typeof (location.state as { from?: unknown } | null)?.from === "string"
    ? (location.state as { from?: string }).from
    : null;

  const roleFromState = (location.state as { role?: unknown } | null)?.role;

  useEffect(() => {
    if (roleFromState === "client" || roleFromState === "talent") {
      setRole(roleFromState);
    }
  }, [roleFromState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    try {
      await login(formData.email, formData.password);
      
      // Get the updated user from the store
      const user = useAuthStore.getState().user;
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      if (user?.role === "client" || user?.role === "talent") {
        if (user.role !== role) {
          await logout();
          toast({
            variant: "destructive",
            title: "Wrong account type",
            description: `This account is registered as a ${user.role}. Please switch to ${user.role} to sign in.`,
          });
          return;
        }
      }

      if (from) {
        navigate(from, { replace: true });
      } else if (user?.role === 'client') {
        navigate('/client-dashboard', { replace: true });
      } else if (user?.role === 'talent') {
        navigate('/talent-dashboard', { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Invalid email or password.";
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex flex-col justify-between bg-navy p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10">
          <Link to="/">
            <img 
              src={voiboxLogo} 
              alt="VoiceBox" 
              className="h-10 w-auto transition-all duration-300 hover:scale-105" 
            />
          </Link>
        </div>
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold font-heading mb-6">Welcome Back to Africa's Premier Voice Marketplace</h1>
          <p className="text-lg text-white/80">
            Connect with top talent, manage your projects, and bring your stories to life with VoiceBox Africa.
          </p>
        </div>
        <div className="relative z-10 text-sm text-white/60">
          © {new Date().getFullYear()} VoiceBox Africa. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center p-8 md:p-12 lg:p-24 bg-background">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold font-heading">Log in to your account</h2>
            <p className="text-muted-foreground mt-2">
              Don't have an account?{" "}
              <Link to="/register" state={{ from, role }} className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-4 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                role === 'client'
                  ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Client
              {role === 'client' && <Check className="w-3 h-3 text-primary" />}
            </button>
            <button
              type="button"
              onClick={() => setRole('talent')}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                role === 'talent'
                  ? 'bg-secondary/10 text-secondary shadow-sm ring-1 ring-secondary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Talent
              {role === 'talent' && <Check className="w-3 h-3 text-secondary" />}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className={`input-styled ${role === 'client' ? 'focus:ring-primary' : 'focus:ring-secondary'}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className={`text-sm hover:underline ${role === 'client' ? 'text-primary' : 'text-secondary'}`}>
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className={`input-styled ${role === 'client' ? 'focus:ring-primary' : 'focus:ring-secondary'}`}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className={role === 'client' ? 'data-[state=checked]:bg-primary' : 'data-[state=checked]:bg-secondary'}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Remember me
              </label>
            </div>

            <Button 
              type="submit" 
              className={`w-full h-11 transition-colors ${
                role === 'client' 
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                  : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
              }`} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Log In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" disabled={isLoading}>
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Google
            </Button>
            <Button variant="outline" type="button" disabled={isLoading}>
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.025 1c-2.925 0-4.926 2.053-5.12 2.302-.078.106-.056.273.048.375.105.103.27.085.352-.022.203-.263 2.078-2.536 4.72-2.536 2.226 0 3.794 1.764 3.794 3.794 0 2.226-1.764 3.794-3.794 3.794-2.03 0-3.794-1.568-3.794-3.794 0-.135-.11-.245-.245-.245h-.545c-.135 0-.245.11-.245.245 0 2.527 2.056 4.584 4.584 4.584 2.528 0 4.584-2.057 4.584-4.584C17.61 3.056 15.553 1 13.025 1zM2.553 14.936c.03.09.113.15.208.15h.564c.094 0 .177-.06.207-.15.422-1.264 1.62-2.17 3.022-2.17 1.765 0 3.2 1.435 3.2 3.2 0 1.765-1.435 3.2-3.2 3.2-1.402 0-2.6-1.127-3.022-2.39-.03-.09-.113-.15-.208-.15h-.564c-.094 0-.177.06-.207.15-.422 1.264-1.62 2.17-3.022 2.17-1.765 0-3.2 1.435-3.2 3.2 0 1.765 1.435 3.2 3.2 3.2 1.402 0 2.6-1.127 3.022-2.39.03-.09.113-.15.208-.15h.564c.094 0 .177.06.207.15.422 1.264 1.62 2.17 3.022 2.17 1.765 0 3.2 1.435 3.2 3.2 0 1.765-1.435 3.2-3.2 3.2-1.402 0-2.6-1.127-3.022-2.39-.03-.09-.113-.15-.208-.15h-.564c-.094 0-.177.06-.207.15-.422 1.264-1.62 2.17-3.022 2.17-1.765 0-3.2 1.435-3.2 3.2 0 1.765-1.435 3.2-3.2 3.2-1.402 0-2.6-1.127-3.022-2.39z"></path>
              </svg>
              Apple
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
