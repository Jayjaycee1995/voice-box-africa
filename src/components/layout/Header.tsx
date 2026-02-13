import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  Search, 
  Mic, 
  LogOut, 
  User, 
  ChevronDown, 
  LayoutDashboard, 
  MessageSquare, 
  Bell,
  Briefcase,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import voiboxLogo from "@/assets/voibox-logo.png";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProtectedAction = (path: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const dashboardLink = user?.role === 'client' ? '/client-dashboard' : '/talent-dashboard';

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b bg-background",
        scrolled 
          ? "shadow-lg py-2 border-border" 
          : "border-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link 
            to={isAuthenticated ? dashboardLink : "/"} 
            className="flex items-center gap-2 group transition-transform active:scale-95"
          >
            <img 
              src={voiboxLogo} 
              alt="VOICEBOX Africa" 
              className="h-9 w-auto transition-all duration-300 group-hover:brightness-110" 
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {/* Find Talent */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-primary/5 data-[state=open]:bg-primary/5 font-medium text-[15px] dark:hover:bg-primary/10 dark:data-[state=open]:bg-primary/10 dark:hover:backdrop-blur-md dark:hover:bg-opacity-20 dark:border dark:border-transparent dark:hover:border-primary/20 transition-all duration-200">
                    Find Talent
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 w-[320px] grid gap-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="grid gap-1">
                        <NavigationMenuLink asChild>
                          <Link 
                            to="/artists" 
                            className="flex items-start gap-3 p-3 hover:bg-accent rounded-lg transition-all group"
                          >
                            <div className="mt-1 bg-primary/10 p-2 rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold">Browse Voice Artists</div>
                              <p className="text-xs text-muted-foreground mt-0.5">Find the perfect voice for your project from 1000+ talents.</p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                      <div className="grid gap-1">
                        <button
                          onClick={() => handleProtectedAction("/post-gig")}
                          className="flex items-start gap-3 p-3 hover:bg-accent rounded-lg transition-all group w-full text-left"
                        >
                          <div className="mt-1 bg-primary/10 p-2 rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Mic className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">Post a Project</div>
                            <p className="text-xs text-muted-foreground mt-0.5">Share your requirements and get custom auditions fast.</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Find Work */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-primary/5 data-[state=open]:bg-primary/5 font-medium text-[15px] dark:hover:bg-primary/10 dark:data-[state=open]:bg-primary/10 dark:hover:backdrop-blur-md dark:hover:bg-opacity-20 dark:border dark:border-transparent dark:hover:border-primary/20 transition-all duration-200">
                    Find Work
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 w-[320px] grid gap-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="grid gap-1">
                        <button
                          onClick={() => handleProtectedAction("/browse-gigs")}
                          className="flex items-start gap-3 p-3 hover:bg-accent rounded-lg transition-all group w-full text-left"
                        >
                          <div className="mt-1 bg-primary/10 p-2 rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">Browse Gigs</div>
                            <p className="text-xs text-muted-foreground mt-0.5">Explore open projects and submit your best proposals.</p>
                          </div>
                        </button>
                      </div>
                      <div className="grid gap-1">
                        <button
                          onClick={() => handleProtectedAction("/invitations")}
                          className="flex items-start gap-3 p-3 hover:bg-accent rounded-lg transition-all group w-full text-left"
                        >
                          <div className="mt-1 bg-primary/10 p-2 rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">My Invitations</div>
                            <p className="text-xs text-muted-foreground mt-0.5">View direct project invitations from interested clients.</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link 
                    to="/how-it-works" 
                    className={cn(
                      navigationMenuTriggerStyle(), 
                      "bg-transparent font-medium text-[15px] hover:bg-primary/5 dark:hover:bg-primary/10 dark:hover:backdrop-blur-md dark:hover:bg-opacity-20 dark:border dark:border-transparent dark:hover:border-primary/20 transition-all duration-200"
                    )}
                  >
                    How It Works
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <ModeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-border ml-2">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary transition-colors" asChild>
                  <Link to="/messages">
                    <MessageSquare className="w-5 h-5" />
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="pl-1 pr-2 gap-2 hover:bg-primary/5 h-10 transition-all rounded-full border border-transparent hover:border-border dark:hover:bg-primary/10 dark:hover:backdrop-blur-md dark:hover:bg-opacity-20 dark:hover:border-primary/20">
                      <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        <AvatarImage src={user?.profile_image} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start leading-none text-left mr-1">
                        <span className="text-sm font-semibold truncate max-w-[100px]">{user?.name.split(' ')[0]}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">{user?.role}</span>
                      </div>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <DropdownMenuLabel className="px-3 py-2">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2">
                      <Link to={dashboardLink}>
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2">
                      <Link to="/profile">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2 animate-in fade-in duration-500">
                <Button variant="ghost" asChild className="font-semibold text-[15px] hover:bg-primary/5 px-6 dark:hover:bg-primary/10 dark:hover:backdrop-blur-md dark:hover:bg-opacity-20 dark:border dark:border-transparent dark:hover:border-primary/20 transition-all duration-200">
                  <Link to="/login">Log In</Link>
                </Button>
                <Button variant="hero" asChild className="px-6 shadow-md hover:shadow-xl transition-all active:scale-95 font-semibold dark:hover:bg-primary/90 dark:hover:backdrop-blur-sm">
                  <Link to="/register">Join Free</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <ModeToggle />
            <button
              className="p-2.5 text-foreground hover:bg-accent rounded-full transition-all active:scale-90 border border-border/50 shadow-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[65px] bg-background/98 backdrop-blur-xl z-50 animate-in fade-in slide-in-from-right duration-300">
            <nav className="flex flex-col h-full container mx-auto px-4 py-8 gap-6 overflow-y-auto">
              <div className="grid gap-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">Navigation</p>
                <Link
                  to="/artists"
                  className="px-4 py-3.5 text-lg font-semibold hover:bg-accent rounded-xl transition-all flex items-center justify-between group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <span>Find Talent</span>
                  </div>
                  <ChevronDown className="w-5 h-5 -rotate-90 text-muted-foreground" />
                </Link>
                <button
                  onClick={() => {
                    handleProtectedAction("/post-gig");
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-3.5 text-lg font-semibold hover:bg-accent rounded-xl transition-all flex items-center justify-between group text-left w-full"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Mic className="w-5 h-5" />
                    </div>
                    <span>Post a Project</span>
                  </div>
                  <ChevronDown className="w-5 h-5 -rotate-90 text-muted-foreground" />
                </button>
                <button
                  onClick={() => {
                    handleProtectedAction("/browse-gigs");
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-3.5 text-lg font-semibold hover:bg-accent rounded-xl transition-all flex items-center justify-between group text-left w-full"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span>Find Work</span>
                  </div>
                  <ChevronDown className="w-5 h-5 -rotate-90 text-muted-foreground" />
                </button>
                <Link
                  to="/how-it-works"
                  className="px-4 py-3.5 text-lg font-semibold hover:bg-accent rounded-xl transition-all flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Search className="w-5 h-5" />
                  </div>
                  How It Works
                </Link>
              </div>

              <div className="mt-auto pb-12 grid gap-4">
                {isAuthenticated ? (
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 px-4 py-4 bg-accent/50 rounded-2xl border border-border">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={user?.profile_image} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">{user?.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="h-14 rounded-xl text-lg font-bold gap-3" asChild onClick={() => setIsMenuOpen(false)}>
                      <Link to={dashboardLink}>
                        <LayoutDashboard className="w-5 h-5" />
                        Go to Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" className="h-14 rounded-xl text-lg font-bold gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
                      <LogOut className="w-5 h-5" />
                      Log Out
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <Button variant="outline" asChild className="h-14 rounded-xl text-lg font-bold shadow-sm">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                    </Button>
                    <Button variant="hero" asChild className="h-14 rounded-xl text-lg font-bold shadow-lg">
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>Join Voicebox Africa</Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;