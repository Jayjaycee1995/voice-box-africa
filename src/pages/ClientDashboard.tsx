import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { Gig, Proposal } from "@/lib/database.types";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  Star,
  Plus,
  MoreVertical,
  Bell,
  LogOut,
  FileCheck2,
  XCircle,
  Check,
  User
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MessagesView from "@/components/dashboard/MessagesView";
import ProjectsView from "@/components/dashboard/ProjectsView";
import PaymentsView from "@/components/dashboard/PaymentsView";
import SettingsView from "@/components/dashboard/SettingsView";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type TabType = "overview" | "projects" | "proposals" | "messages" | "payments" | "settings";

const statusConfig = {
  open: { label: "Open", color: "bg-blue-100 text-blue-700" },
  assigned: { label: "Assigned", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { user, logout, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [recentProjects, setRecentProjects] = useState<Gig[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [proposalFilter, setProposalFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [chartData, setChartData] = useState<Array<{ name: string; spent: number }>>([]);
  const [recentMessages, setRecentMessages] = useState<
    Array<{ id: number; from: string; avatar: string; message: string; time: string; unread: boolean }>
  >([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalSpent: 0,
    completed: 0,
    avgRating: null as number | null,
  });

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true, state: { from: `${location.pathname}${location.search}` } });
    }
  }, [loading, location.pathname, location.search, navigate, user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch Gigs
        const { data: gigs, error } = await supabase
          .from('gigs')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (gigs) {
          setRecentProjects(gigs.slice(0, 3) as unknown as Gig[]);

          const active = gigs.filter(g => g.status === 'open' || g.status === 'assigned').length;
          const completed = gigs.filter(g => g.status === 'completed').length;
          const spent = gigs
            .filter(g => g.status === 'completed')
            .reduce((acc, curr) => acc + (curr.budget || 0), 0);

          setStats(prev => ({
            ...prev,
            activeProjects: active,
            totalSpent: spent,
            completed: completed
          }));

          const months: Array<{ label: string; key: string }> = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1);
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            months.push({ label: format(d, "MMM"), key });
          }

          const totalsByMonth = new Map(months.map(m => [m.key, 0]));
          gigs.forEach((g) => {
            if (g.status !== 'completed') return;
            const createdAt = new Date(g.created_at);
            const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
            if (!totalsByMonth.has(key)) return;
            totalsByMonth.set(key, (totalsByMonth.get(key) || 0) + (g.budget || 0));
          });

          setChartData(months.map(m => ({ name: m.label, spent: totalsByMonth.get(m.key) || 0 })));
        }

        type RawMessage = {
          id: number;
          content: string;
          created_at: string;
          is_read: boolean;
          sender_id: string;
          receiver_id: string;
          sender?: { name: string | null; profile_image: string | null };
          receiver?: { name: string | null; profile_image: string | null };
        };

        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('id, content, created_at, is_read, sender_id, receiver_id, sender:sender_id(name, profile_image), receiver:receiver_id(name, profile_image)')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (messagesError) throw messagesError;

        if (messagesData) {
          const formatted = (messagesData as unknown as RawMessage[]).map((m) => {
            const isSender = m.sender_id === user.id;
            const other = isSender ? m.receiver : m.sender;
            const otherName = other?.name || "Unknown";
            const otherAvatar = other?.profile_image || "";
            return {
              id: m.id,
              from: otherName,
              avatar: otherAvatar,
              message: m.content,
              time: formatDistanceToNow(new Date(m.created_at), { addSuffix: true }),
              unread: m.receiver_id === user.id && !m.is_read,
            };
          });
          setRecentMessages(formatted);
        } else {
          setRecentMessages([]);
        }

        const { data: unreadData, error: unreadError } = await supabase
          .from('messages')
          .select('id')
          .eq('receiver_id', user.id)
          .eq('is_read', false);

        if (unreadError) throw unreadError;
        setUnreadMessagesCount(unreadData?.length ?? 0);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Fetch proposals when tab is active
  useEffect(() => {
    const fetchProposals = async () => {
      if (!user || activeTab !== 'proposals') return;
      
      setProposalsLoading(true);
      try {
        // First get the client's gigs
        const { data: gigs, error: gigsError } = await supabase
          .from('gigs')
          .select('id')
          .eq('client_id', user.id);

        if (gigsError) throw gigsError;
        if (!gigs || gigs.length === 0) {
          setProposals([]);
          setProposalsLoading(false);
          return;
        }

        const gigIds = gigs.map(g => g.id);

        // Then get proposals for those gigs
        const { data: proposalsData, error: proposalsError } = await supabase
          .from('proposals')
          .select(`
            *,
            gig:gigs(title, description, budget, deadline, status),
            talent:users(name, email, profile_image, skills, bio)
          `)
          .in('gig_id', gigIds)
          .order('created_at', { ascending: false });

        if (proposalsError) throw proposalsError;
        setProposals(proposalsData as unknown as Proposal[] || []);
      } catch (error) {
        console.error('Error fetching proposals:', error);
      } finally {
        setProposalsLoading(false);
      }
    };

    fetchProposals();
  }, [user, activeTab]);

  const handleAcceptProposal = async (proposalId: number) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', proposalId);

      if (error) throw error;

      setProposals(prev => prev.map(p => 
        p.id === proposalId ? { ...p, status: 'accepted' } : p
      ));
      toast.success('Proposal accepted! The talent has been notified.');
    } catch (error) {
      console.error('Error accepting proposal:', error);
      toast.error('Failed to accept proposal. Please try again.');
    }
  };

  const handleRejectProposal = async (proposalId: number) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', proposalId);

      if (error) throw error;

      setProposals(prev => prev.map(p => 
        p.id === proposalId ? { ...p, status: 'rejected' } : p
      ));
      toast.success('Proposal rejected.');
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      toast.error('Failed to reject proposal. Please try again.');
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "My Projects", icon: FileText },
    { id: "proposals", label: "Proposals", icon: FileCheck2 },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined },
    { id: "payments", label: "Payments", icon: DollarSign },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const statsDisplay = [
    { label: "Active Projects", value: stats.activeProjects.toString(), icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Spent", value: `${stats.totalSpent.toFixed(2)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { label: "Completed", value: stats.completed.toString(), icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Avg. Rating", value: stats.avgRating == null ? "—" : stats.avgRating.toFixed(1), icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" },
  ];

  // Filtered proposals based on status
  const filteredProposals = proposalFilter === 'all' 
    ? proposals 
    : proposals.filter(p => p.status === proposalFilter);

  // Group proposals by gig
  const groupedProposals = filteredProposals.reduce((acc, proposal) => {
    const gigId = proposal.gig_id;
    if (!acc[gigId]) {
      acc[gigId] = {
        gig: proposal.gig,
        proposals: []
      };
    }
    acc[gigId].proposals.push(proposal);
    return acc;
  }, {} as Record<number, { gig: Proposal['gig']; proposals: Proposal[] }>);

  // Proposal stats
  const proposalStats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="flex pt-16 min-h-screen">
        {/* Sidebar Navigation - Desktop only */}
        <aside className="hidden lg:flex flex-col w-64 fixed h-full bg-background border-r border-border pt-6 pb-4 px-4 z-10">
           <div className="space-y-1">
             {tabs.map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as TabType)}
                 className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                   activeTab === tab.id
                     ? "bg-primary text-primary-foreground shadow-md"
                     : "text-muted-foreground hover:bg-muted hover:text-foreground"
                 }`}
               >
                 <div className="flex items-center gap-3">
                   <tab.icon className="w-5 h-5" />
                   <span>{tab.label}</span>
                 </div>
                 {tab.badge && (
                   <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-bold shadow-sm">
                     {tab.badge}
                   </span>
                 )}
               </button>
             ))}
           </div>
           
           <div className="mt-auto pt-6 border-t">
             <div className="flex items-center gap-3 px-3 py-3">
               <Avatar className="w-10 h-10 border-2 border-primary/20">
                 <AvatarFallback className="bg-primary/10 text-primary">{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
               </Avatar>
               <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-medium truncate">{user?.email || 'User'}</p>
                 <p className="text-xs text-muted-foreground truncate">Client Account</p>
               </div>
               <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={handleLogout}>
                 <LogOut className="w-4 h-4" />
               </Button>
             </div>
           </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabType)}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 md:p-8 pb-24 lg:pb-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {activeTab === "overview" && (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, here's what's happening today.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="rounded-full relative">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                    {unreadMessagesCount > 0 && (
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
                    )}
                    </Button>
                    <Button className="btn-gradient shadow-lg" asChild>
                      <Link to="/post-gig"><Plus className="w-4 h-4 mr-2" />Post a Project</Link>
                    </Button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {statsDisplay.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                          <h3 className="text-3xl font-bold font-heading">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                   {/* Chart Section */}
                   <Card className="lg:col-span-2 border-none shadow-sm">
                     <CardHeader>
                       <CardTitle>Spending Overview</CardTitle>
                       <CardDescription>Your project expenses over the last 6 months.</CardDescription>
                     </CardHeader>
                     <CardContent>
                       <div className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                             <defs>
                               <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                               </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                             <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                             <Tooltip 
                               contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                               itemStyle={{ color: '#1f2937' }}
                             />
                             <Area type="monotone" dataKey="spent" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
                           </AreaChart>
                         </ResponsiveContainer>
                       </div>
                     </CardContent>
                   </Card>

                   {/* Recent Messages */}
                   <Card className="border-none shadow-sm">
                     <CardHeader>
                       <CardTitle>Recent Messages</CardTitle>
                       <CardDescription>Latest updates from talent.</CardDescription>
                     </CardHeader>
                     <CardContent className="p-0">
                       <ScrollArea className="h-[300px]">
                         <div className="divide-y">
                          {recentMessages.length === 0 ? (
                            <div className="p-6 text-center text-muted-foreground">
                              No recent messages.
                            </div>
                          ) : (
                            recentMessages.map((msg) => (
                              <div key={msg.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={msg.avatar} />
                                  <AvatarFallback>{msg.from.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1">
                                    <p className={`text-sm font-medium ${msg.unread ? 'text-foreground' : 'text-muted-foreground'}`}>{msg.from}</p>
                                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                                  </div>
                                  <p className={`text-sm truncate ${msg.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{msg.message}</p>
                                </div>
                                {msg.unread && <span className="w-2 h-2 rounded-full bg-primary mt-2" />}
                              </div>
                            ))
                          )}
                         </div>
                       </ScrollArea>
                     </CardContent>
                   </Card>
                </div>

                {/* Projects Table */}
                <Card className="border-none shadow-sm">
                   <CardHeader className="flex flex-row items-center justify-between">
                     <div>
                       <CardTitle>Recent Projects</CardTitle>
                       <CardDescription>Status updates on your active gigs.</CardDescription>
                     </div>
                     <Button variant="ghost" className="gap-1 text-primary" onClick={() => setActiveTab("projects")}>
                       View All <ChevronRight className="w-4 h-4" />
                     </Button>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-4">
                       {recentProjects.length === 0 ? (
                         <div className="text-center py-8 text-muted-foreground">
                           No projects yet. Post a gig to get started!
                         </div>
                       ) : (
                         recentProjects.map((project) => (
                           <div key={project.id} className="flex flex-col gap-3 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors bg-card/50">
                             <div className="flex items-center justify-between gap-4">
                               <div className="flex items-center gap-3 min-w-0">
                                 <Avatar className="w-10 h-10 rounded-lg flex-shrink-0">
                                   <AvatarFallback>VO</AvatarFallback>
                                 </Avatar>
                                 <div className="min-w-0">
                                   <h4 className="font-semibold text-foreground truncate">{project.title}</h4>
                                   <p className="text-sm text-muted-foreground">Budget: ${project.budget}</p>
                                 </div>
                               </div>
                               <Button variant="ghost" size="icon" className="flex-shrink-0">
                                 <MoreVertical className="w-4 h-4 text-muted-foreground" />
                               </Button>
                             </div>
                             <div className="flex flex-wrap items-center gap-3">
                               <div>
                                 <p className="text-xs text-muted-foreground">Budget</p>
                                 <p className="text-sm font-medium text-foreground">${project.budget}</p>
                               </div>
                               <div>
                                 <p className="text-xs text-muted-foreground">Deadline</p>
                                 <p className="text-sm font-medium text-foreground">{format(new Date(project.deadline), 'MMM dd, yyyy')}</p>
                               </div>
                               <Badge className={`${statusConfig[project.status as keyof typeof statusConfig]?.color || "bg-gray-100 text-gray-700"} px-3 py-1 rounded-full capitalize ml-auto`}>
                                 {statusConfig[project.status as keyof typeof statusConfig]?.label || project.status}
                               </Badge>
                             </div>
                           </div>
                         ))
                       )}
                     </div>
                   </CardContent>
                </Card>
              </>
            )}
            
            {activeTab === "projects" && <ProjectsView role="client" />}
            
            {activeTab === "proposals" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground">Proposals</h1>
                    <p className="text-muted-foreground mt-1">Review and manage proposals from talents.</p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card 
                    className={`cursor-pointer border-none shadow-sm transition-all hover:shadow-md ${proposalFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setProposalFilter('all')}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">All</p>
                        <p className="text-2xl font-bold">{proposalStats.total}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileCheck2 className="w-5 h-5 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer border-none shadow-sm transition-all hover:shadow-md ${proposalFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
                    onClick={() => setProposalFilter('pending')}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{proposalStats.pending}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-yellow-100">
                        <Star className="w-5 h-5 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer border-none shadow-sm transition-all hover:shadow-md ${proposalFilter === 'accepted' ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => setProposalFilter('accepted')}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Accepted</p>
                        <p className="text-2xl font-bold text-green-600">{proposalStats.accepted}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-green-100">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer border-none shadow-sm transition-all hover:shadow-md ${proposalFilter === 'rejected' ? 'ring-2 ring-red-500' : ''}`}
                    onClick={() => setProposalFilter('rejected')}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">{proposalStats.rejected}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-red-100">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Content */}
                {proposalsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredProposals.length === 0 ? (
                  <Card className="border-none shadow-sm">
                    <CardContent className="py-16 text-center">
                      <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                        <FileCheck2 className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {proposalFilter === 'all' ? 'No Proposals Yet' : `No ${proposalFilter} Proposals`}
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {proposalFilter === 'all' 
                          ? "You haven't received any proposals yet. Post a gig to start receiving proposals from talented voice artists."
                          : `You don't have any ${proposalFilter} proposals at the moment.`}
                      </p>
                      {proposalFilter !== 'all' && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setProposalFilter('all')}
                        >
                          View All Proposals
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedProposals).map(([gigId, { gig, proposals: gigProposals }]) => (
                      <Card key={gigId} className="border-none shadow-sm overflow-hidden">
                        {/* Gig Header */}
                        <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{gig?.title || 'Unknown Gig'}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  Budget: ${gig?.budget}
                                </span>
                                <span>•</span>
                                <span>{gigProposals.length} proposal{gigProposals.length !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                            <Badge className="bg-white/50 text-foreground border">
                              {gig?.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Proposals List */}
                        <div className="divide-y">
                          {gigProposals.map((proposal) => (
                            <div key={proposal.id} className="p-4 hover:bg-muted/30 transition-colors">
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                {/* Talent Avatar & Info */}
                                <div className="flex items-center gap-3 md:w-56 flex-shrink-0">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={proposal.talent?.profile_image} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                      {proposal.talent?.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{proposal.talent?.name || 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground truncate">{proposal.talent?.email}</p>
                                  </div>
                                </div>

                                {/* Bid & Time */}
                                <div className="flex items-center gap-6 md:w-48 flex-shrink-0">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Bid</p>
                                    <p className="font-semibold text-green-600">${proposal.bid_amount}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Submitted</p>
                                    <p className="text-sm">{formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}</p>
                                  </div>
                                </div>

                                {/* Status */}
                                <div className="md:w-24 flex-shrink-0">
                                  <Badge className={`
                                    ${proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''}
                                    ${proposal.status === 'accepted' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                                    ${proposal.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100' : ''}
                                  `}>
                                    {proposal.status}
                                  </Badge>
                                </div>

                                {/* Cover Letter Preview */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground mb-1">Cover Letter</p>
                                  <p className="text-sm line-clamp-2 text-muted-foreground">
                                    {proposal.cover_letter}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {proposal.status === 'pending' && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleAcceptProposal(proposal.id)}
                                      >
                                        <Check className="w-3 h-3 mr-1" /> Accept
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => handleRejectProposal(proposal.id)}
                                      >
                                        <XCircle className="w-3 h-3 mr-1" /> Reject
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "messages" && <MessagesView />}

            {activeTab === "payments" && <PaymentsView role="client" />}

            {activeTab === "settings" && <SettingsView />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
