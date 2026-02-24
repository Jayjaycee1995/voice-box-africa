import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { Proposal } from "@/lib/database.types";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  DollarSign,
  Mic,
  TrendingUp,
  Star,
  ChevronRight,
  Upload,
  Eye,
  LogOut,
  Bell,
  Clock
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MessagesView from "@/components/dashboard/MessagesView";
import ProjectsView from "@/components/dashboard/ProjectsView";
import PaymentsView from "@/components/dashboard/PaymentsView";
import SettingsView from "@/components/dashboard/SettingsView";
import TalentProfileView from "@/components/dashboard/TalentProfileView";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";

type TabType = "overview" | "jobs" | "messages" | "earnings" | "profile" | "settings";

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
};

interface ProposalWithGig {
  id: number;
  status: string;
  bid_amount: number;
  created_at: string;
  gig?: {
    title: string;
    budget: number;
  };
}

const TalentDashboard = () => {
  const { user, updateProfile, logout, loading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isAvailable, setIsAvailable] = useState(user?.is_available ?? true);
  const [activeJobs, setActiveJobs] = useState<ProposalWithGig[]>([]); 
  const [earningsData, setEarningsData] = useState<Array<{ name: string; amount: number }>>([
    { name: 'Mon', amount: 0 },
    { name: 'Tue', amount: 0 },
    { name: 'Wed', amount: 0 },
    { name: 'Thu', amount: 0 },
    { name: 'Fri', amount: 0 },
    { name: 'Sat', amount: 0 },
    { name: 'Sun', amount: 0 },
  ]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [stats, setStats] = useState({
    activeJobs: 0,
    pendingEarnings: 0,
    totalEarned: 0,
    avgRating: null as number | null,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsAvailable(user?.is_available ?? true);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true, state: { from: `${location.pathname}${location.search}` } });
    }
  }, [loading, location.pathname, location.search, navigate, user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch Proposals
        const { data: proposals, error } = await supabase
          .from('proposals')
          .select('*, gig:gigs(*)')
          .eq('talent_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (proposals) {
          const typed = proposals as unknown as Array<ProposalWithGig & { gig?: { title: string; budget: number } }>;
          setActiveJobs(typed.slice(0, 3));

          const activeCount = typed.filter(p => ['pending', 'accepted'].includes(p.status)).length;
          const earned = typed
            .filter(p => p.status === 'accepted')
            .reduce((acc, curr) => acc + (curr.bid_amount || 0), 0);

          const now = new Date();
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 6);

          const dayIndexByName: Record<string, number> = {
            Mon: 0,
            Tue: 1,
            Wed: 2,
            Thu: 3,
            Fri: 4,
            Sat: 5,
            Sun: 6,
          };

          const daily = [
            { name: 'Mon', amount: 0 },
            { name: 'Tue', amount: 0 },
            { name: 'Wed', amount: 0 },
            { name: 'Thu', amount: 0 },
            { name: 'Fri', amount: 0 },
            { name: 'Sat', amount: 0 },
            { name: 'Sun', amount: 0 },
          ];

          typed.forEach((p) => {
            if (p.status !== 'accepted') return;
            const d = new Date(p.created_at);
            if (Number.isNaN(d.getTime())) return;
            if (d < sevenDaysAgo || d > now) return;
            const name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
            const idx = dayIndexByName[name];
            if (idx == null) return;
            daily[idx].amount += p.bid_amount || 0;
          });

          setEarningsData(daily);

          setStats({
            activeJobs: activeCount,
            pendingEarnings: 0,
            totalEarned: earned,
            avgRating: null
          });
        }

        const { data: unreadData, error: unreadError } = await supabase
          .from('messages')
          .select('id')
          .eq('receiver_id', user.id)
          .eq('is_read', false);

        if (unreadError) throw unreadError;
        setUnreadMessagesCount(unreadData?.length ?? 0);
      } catch (error) {
        console.error("Error fetching talent dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleAvailabilityChange = async (checked: boolean) => {
    setIsAvailable(checked);
    try {
      await updateProfile({ is_available: checked });
      toast({ title: "Availability Updated", description: `You are now ${checked ? 'available' : 'unavailable'} for new work.` });
    } catch (error) {
      console.error(error);
      setIsAvailable(!checked); 
      toast({ title: "Error", description: "Failed to update availability", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/", { replace: true });
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "jobs", label: "Active Jobs", icon: FileText, badge: stats.activeJobs > 0 ? stats.activeJobs : undefined },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "profile", label: "My Profile", icon: Mic },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const statsDisplay = [
    { label: "Active Jobs", value: stats.activeJobs.toString(), icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Pending Earnings", value: `$${stats.pendingEarnings.toFixed(2)}`, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Total Earned", value: `$${stats.totalEarned.toFixed(2)}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
    { label: "Avg. Rating", value: stats.avgRating == null ? "—" : stats.avgRating.toFixed(1), icon: Star, color: "text-purple-600", bg: "bg-purple-100" },
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
                 <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
                 <p className="text-xs text-muted-foreground truncate">Talent Account</p>
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
                    <p className="text-muted-foreground mt-1">Track your gigs and earnings.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full border shadow-sm">
                      <span className="text-sm text-muted-foreground">Availability</span>
                      <Switch checked={isAvailable} onCheckedChange={handleAvailabilityChange} />
                      <span className={`text-xs font-bold uppercase ${isAvailable ? "text-green-600" : "text-muted-foreground"}`}>
                        {isAvailable ? "On" : "Off"}
                      </span>
                    </div>
                    <Button variant="outline" size="icon" className="rounded-full relative">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      {unreadMessagesCount > 0 && (
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
                      )}
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
                   {/* Earnings Chart */}
                   <Card className="lg:col-span-2 border-none shadow-sm">
                     <CardHeader>
                       <CardTitle>Weekly Earnings</CardTitle>
                       <CardDescription>Your income over the last 7 days.</CardDescription>
                     </CardHeader>
                     <CardContent>
                       <div className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={earningsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                             <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                             <Tooltip 
                               cursor={{fill: '#f3f4f6'}}
                               contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                               itemStyle={{ color: '#1f2937' }}
                             />
                             <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                           </BarChart>
                         </ResponsiveContainer>
                       </div>
                     </CardContent>
                   </Card>

                   {/* Quick Actions */}
                   <Card className="border-none shadow-sm">
                     <CardHeader>
                       <CardTitle>Quick Actions</CardTitle>
                       <CardDescription>Shortcuts to common tasks.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start h-12" onClick={() => setActiveTab("profile")}>
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Upload className="w-4 h-4 text-primary" />
                          </div>
                          Upload New Demo
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12" onClick={() => setActiveTab("profile")}>
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <Eye className="w-4 h-4 text-purple-600" />
                          </div>
                          View Public Profile
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                            <Star className="w-4 h-4 text-yellow-600" />
                          </div>
                          View Reviews
                        </Button>
                     </CardContent>
                   </Card>
                </div>

                {/* Active Jobs */}
                <Card className="border-none shadow-sm">
                   <CardHeader className="flex flex-row items-center justify-between">
                     <div>
                       <CardTitle>Recent Activity</CardTitle>
                       <CardDescription>Your latest proposals and active jobs.</CardDescription>
                     </div>
                     <Button variant="ghost" className="gap-1 text-primary" onClick={() => setActiveTab("jobs")}>
                       View All <ChevronRight className="w-4 h-4" />
                     </Button>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-4">
                       {activeJobs.length === 0 ? (
                         <div className="text-center py-8 text-muted-foreground">
                           No active jobs or proposals.
                         </div>
                       ) : (
                         activeJobs.map((job) => (
                           <div key={job.id} className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors bg-card/50">
                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                               <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                   <Mic className="w-6 h-6 text-primary" />
                                 </div>
                                 <div>
                                   <h4 className="font-semibold text-foreground">{job.gig?.title || "Unknown Project"}</h4>
                                   <p className="text-sm text-muted-foreground">Bid: ${job.bid_amount}</p>
                                 </div>
                               </div>
                               <div className="flex items-center gap-4">
                                 <div className="text-right hidden md:block">
                                   <p className="text-sm font-medium text-foreground">${job.bid_amount}</p>
                                   <p className="text-xs text-muted-foreground">Bid Amount</p>
                                 </div>
                                 <Badge className={`${statusConfig[job.status as keyof typeof statusConfig]?.color || "bg-gray-100 text-gray-700"} px-3 py-1 rounded-full capitalize`}>
                                   {statusConfig[job.status as keyof typeof statusConfig]?.label || job.status}
                                 </Badge>
                               </div>
                             </div>
                           </div>
                         ))
                       )}
                     </div>
                   </CardContent>
                </Card>
              </>
            )}
            
            {activeTab === "jobs" && <ProjectsView role="talent" />}
            
            {activeTab === "messages" && <MessagesView />}

            {activeTab === "earnings" && <PaymentsView role="talent" />}

            {activeTab === "profile" && <TalentProfileView />}

            {activeTab === "settings" && <SettingsView />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TalentDashboard;
