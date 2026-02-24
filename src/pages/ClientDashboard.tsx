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
import { Gig } from "@/lib/database.types";
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
  LogOut
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MessagesView from "@/components/dashboard/MessagesView";
import ProjectsView from "@/components/dashboard/ProjectsView";
import PaymentsView from "@/components/dashboard/PaymentsView";
import SettingsView from "@/components/dashboard/SettingsView";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { format, formatDistanceToNow } from "date-fns";

type TabType = "overview" | "projects" | "messages" | "payments" | "settings";

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

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "My Projects", icon: FileText },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined },
    { id: "payments", label: "Payments", icon: DollarSign },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const statsDisplay = [
    { label: "Active Projects", value: stats.activeProjects.toString(), icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Spent", value: `$${stats.totalSpent.toFixed(2)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { label: "Completed", value: stats.completed.toString(), icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Avg. Rating", value: stats.avgRating == null ? "—" : stats.avgRating.toFixed(1), icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" },
  ];

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
