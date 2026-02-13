import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Bell, MessageSquare, ChevronDown, LayoutDashboard, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import voiboxLogo from "@/assets/voibox-logo.png";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'proposal' | 'message' | 'system';
  link: string;
}

interface Proposal {
  id: string;
  talent?: {
    name: string;
  };
  created_at: string;
}

interface Gig {
  id: string;
  title: string;
  proposals?: Proposal[];
}

interface Invitation {
  id: string;
  status: string;
  client?: {
    name: string;
  };
  gig?: {
    title: string;
  };
  created_at: string;
}

interface Conversation {
  id: string;
  unread_count: number;
  other_user?: {
    name: string;
  };
  updated_at: string;
}

const DashboardHeader = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchActivity = async () => {
      if (!user) return;
      
      try {
        const allNotifications: any[] = [];
        
        // Fetch proposals for client, or new invitations for talent
        if (user.role === 'client') {
          const gigResponse = await api.get<Gig[]>('/my-gigs');
          if (!isMounted) return;
          const gigs = gigResponse.data;
          gigs.forEach((gig) => {
            if (gig.proposals && gig.proposals.length > 0) {
              const latestProposal = gig.proposals[0];
              allNotifications.push({
                id: `prop-${latestProposal.id}`,
                title: "New Proposal",
                description: `${latestProposal.talent?.name || 'A talent'} submitted a proposal for "${gig.title}"`,
                time: new Date(latestProposal.created_at).toLocaleString(),
                type: 'proposal',
                link: `/gigs/${gig.id}`
              });
            }
          });
        } else {
          const invResponse = await api.get<Invitation[]>('/invitations');
          if (!isMounted) return;
          const invitations = invResponse.data;
          invitations.forEach((inv) => {
            if (inv.status === 'pending') {
              allNotifications.push({
                id: `inv-${inv.id}`,
                title: "New Invitation",
                description: `${inv.client?.name || 'A client'} invited you to work on "${inv.gig?.title}"`,
                time: new Date(inv.created_at).toLocaleString(),
                type: 'system',
                link: `/invitations`
              });
            }
          });
        }
        
        // Fetch unread messages for both roles
        try {
          const msgResponse = await api.get<Conversation[]>('/conversations');
          if (!isMounted) return;
          const conversations = msgResponse.data;
          conversations.forEach((conv) => {
            if (conv.unread_count > 0) {
              allNotifications.push({
                id: `msg-${conv.id}`,
                title: "New Message",
                description: `You have ${conv.unread_count} unread messages from ${conv.other_user?.name || 'someone'}`,
                time: new Date(conv.updated_at).toLocaleString(),
                type: 'message',
                link: `/messages/${conv.other_user?.id}`
              });
            }
          });
        } catch (e) {
          // Messages might not be fully implemented yet
        }
        
        if (isMounted) {
          setNotifications(allNotifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5));
          setHasUnread(allNotifications.length > 0);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch notifications", error);
        }
      }
    };

    fetchActivity();
    // Poll every 60 seconds
    const interval = setInterval(fetchActivity, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardLink = user?.role === 'client' ? '/client-dashboard' : '/talent-dashboard';

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b h-16",
        scrolled 
          ? "bg-background/80 backdrop-blur-lg border-border shadow-sm" 
          : "bg-background border-border"
      )}
    >
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link 
            to={dashboardLink} 
            className="flex items-center gap-2 group transition-transform active:scale-95"
          >
            <img 
              src={voiboxLogo} 
              alt="VOICEBOX Africa" 
              className="h-10 w-auto transition-all duration-300 group-hover:brightness-110" 
            />
          </Link>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/5 transition-colors rounded-full">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {hasUnread && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <DropdownMenuLabel className="px-3 py-2 flex items-center justify-between">
                  <span className="font-bold">Notifications</span>
                  {hasUnread && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">New</span>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="bg-muted/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">No new notifications</p>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} asChild className="p-0">
                        <Link to={notif.link} className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-accent transition-colors">
                          <div className="flex items-center gap-2 w-full">
                            <div className="bg-primary/10 p-1.5 rounded-md">
                              {notif.type === 'proposal' ? <MessageSquare className="w-3.5 h-3.5 text-primary" /> : <Bell className="w-3.5 h-3.5 text-primary" />}
                            </div>
                            <span className="font-semibold text-xs truncate flex-1">{notif.title}</span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notif.time.split(',')[0]}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 pl-9">{notif.description}</p>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-xs font-medium text-primary cursor-pointer py-2 hover:bg-primary/5">
                  View All Notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <div className="flex items-center pl-2 border-l border-border ml-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="pl-1 pr-2 gap-2 hover:bg-primary/5 h-10 transition-all rounded-full border border-transparent hover:border-border">
                    <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={user?.profile_image} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start leading-none text-left mr-1 hidden sm:flex">
                      <span className="text-sm font-semibold truncate max-w-[100px]">{user?.name.split(' ')[0]}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">{user?.role}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-bold truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate font-normal">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5">
                    <Link to={dashboardLink}>
                      <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5">
                    <Link to="/profile">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5">
                    <Link to="/settings">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer gap-2 py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
