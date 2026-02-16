import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Bell, LogOut, Menu, User, X, Mail, MessageSquare, ChevronDown, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import voiboxLogo from "@/assets/voibox-logo.png";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'proposal' | 'invitation' | 'message' | 'system';
  link: string;
}

interface Proposal {
  id: string;
  created_at: string;
  talent?: {
    name: string;
  };
}

interface GigWithProposals {
  id: string;
  title: string;
  proposals: Proposal[];
}

interface InvitationWithDetails {
  id: string;
  created_at: string;
  status: string;
  gig?: {
    title: string;
  };
  client?: {
    name: string;
  };
}

interface MessageWithSender {
  id: string;
  content: string;
  created_at: string;
  sender?: {
    id: string;
    name: string;
  };
}

const DashboardHeader = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      isMountedRef.current = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user) return;
      
      try {
        const allNotifications: Notification[] = [];
        
        // Fetch proposals for client, or new invitations for talent
        if (user.role === 'client') {
          // Fetch client's gigs with proposals
          const { data: gigs, error: gigsError } = await supabase
            .from('gigs')
            .select(`
              id,
              title,
              proposals:proposals(
                id,
                created_at,
                talent:talent_id(name)
              )
            `)
            .eq('client_id', user.id);
  
          if (!gigsError && gigs) {
            (gigs as unknown as GigWithProposals[]).forEach((gig) => {
              if (gig.proposals && gig.proposals.length > 0) {
                // Sort proposals by date to get the latest
                const sortedProposals = [...gig.proposals].sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                
                const latestProposal = sortedProposals[0];
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
          }
        } else {
          // Fetch invitations for talent
          const { data: invitations, error: invError } = await supabase
            .from('invitations')
            .select(`
              id,
              created_at,
              status,
              gig:gig_id(title),
              client:client_id(name)
            `)
            .eq('talent_id', user.id)
            .eq('status', 'pending');
  
          if (!invError && invitations) {
            (invitations as unknown as InvitationWithDetails[]).forEach((inv) => {
              allNotifications.push({
                id: `inv-${inv.id}`,
                title: "New Invitation",
                description: `${inv.client?.name || 'A client'} invited you to work on "${inv.gig?.title}"`,
                time: new Date(inv.created_at).toLocaleString(),
                type: 'system',
                link: `/invitations`
              });
            });
          }
        }
        
        // Fetch unread messages for both roles
        try {
          const { data: unreadMessages, error: msgError } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              sender:sender_id(id, name)
            `)
            .eq('receiver_id', user.id)
            .eq('is_read', false)
            .order('created_at', { ascending: false });
  
          if (!msgError && unreadMessages && unreadMessages.length > 0) {
            // Group by sender
            const senderMap = new Map();
            
            (unreadMessages as unknown as MessageWithSender[]).forEach((msg) => {
              const senderId = msg.sender?.id;
              if (!senderId) return;
              
              if (!senderMap.has(senderId)) {
                senderMap.set(senderId, {
                  name: msg.sender?.name || 'User',
                  count: 0,
                  lastTime: msg.created_at,
                  lastId: msg.id
                });
              }
              senderMap.get(senderId).count++;
            });
            
            senderMap.forEach((info, senderId) => {
              allNotifications.push({
                id: `msg-${info.lastId}`,
                title: "New Message",
                description: `You have ${info.count} unread messages from ${info.name}`,
                time: new Date(info.lastTime).toLocaleString(),
                type: 'message',
                link: `/messages` 
              });
            });
          }
        } catch (e) {
          console.error("Error processing messages", e);
        }
        
        if (isMountedRef.current) {
          setNotifications(allNotifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5));
          setHasUnread(allNotifications.length > 0);
        }
      } catch (error) {
        if (isMountedRef.current) {
          console.error("Failed to fetch notifications", error);
        }
      }
    };

    if (user) {
      fetchActivity();
      // Set up polling for real-time updates
      const interval = setInterval(fetchActivity, 30000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/", { replace: true });
    }
  };

  const dashboardLink =
    user?.role === 'client' ? '/client-dashboard' : user?.role === 'talent' ? '/talent-dashboard' : '/admin';

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
                        <Link to={notif.link} className="flex flex-col items-start gap-1 p-3 cursor-pointer transition-colors hover:bg-primary/10 dark:hover:bg-primary/15">
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
                      <span className="text-sm font-semibold truncate max-w-[100px]">{user?.name?.split(' ')[0]}</span>
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
