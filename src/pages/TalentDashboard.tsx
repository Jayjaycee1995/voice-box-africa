import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  DollarSign,
  Mic,
  TrendingUp,
  Calendar,
  Star,
  ChevronRight,
  Upload,
  Eye,
  LogOut,
  Bell,
  MoreVertical,
  CheckCircle2,
  Clock
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MessagesView from "@/components/dashboard/MessagesView";
import ProjectsView from "@/components/dashboard/ProjectsView";
import PaymentsView from "@/components/dashboard/PaymentsView";
import SettingsView from "@/components/dashboard/SettingsView";
import TalentProfileView from "@/components/dashboard/TalentProfileView";

type TabType = "overview" | "jobs" | "messages" | "earnings" | "profile" | "settings";

const activeJobs = [
  { id: "1", name: "MTN Commercial - Lagos", client: "MTN Nigeria", status: "in_progress", amount: 75.0, deadline: "Dec 20, 2024", wordCount: 500, progress: 65 },
  { id: "2", name: "E-learning Module", client: "Coursera Africa", status: "pending_review", amount: 120.0, deadline: "Dec 18, 2024", wordCount: 800, progress: 90 },
];

const earningsData = [
  { name: 'Mon', amount: 120 },
  { name: 'Tue', amount: 80 },
  { name: 'Wed', amount: 200 },
  { name: 'Thu', amount: 150 },
  { name: 'Fri', amount: 300 },
  { name: 'Sat', amount: 90 },
  { name: 'Sun', amount: 40 },
];

const statusConfig = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground" },
  in_progress: { label: "Recording", color: "bg-blue-100 text-blue-700" },
  pending_review: { label: "In Review", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
};

const TalentDashboard = () => {
  const { user, setUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isAvailable, setIsAvailable] = useState(user?.is_available ?? true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAvailabilityChange = async (checked: boolean) => {
    setIsAvailable(checked);
    try {
      await api.put('/user/availability', { is_available: checked });
      if (user) {
          setUser({ ...user, is_available: checked });
      }
      toast({ title: "Availability Updated", description: `You are now ${checked ? 'available' : 'unavailable'} for new work.` });
    } catch (error) {
      console.error(error);
      setIsAvailable(!checked); // revert
      toast({ title: "Error", description: "Failed to update availability", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "jobs", label: "Active Jobs", icon: FileText, badge: 2 },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: 1 },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "profile", label: "My Profile", icon: Mic },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const stats = [
    { label: "Active Jobs", value: "2", icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Pending Earnings", value: "$195", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Total Earned", value: "$2,450", icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
    { label: "Avg. Rating", value: "4.9", icon: Star, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="flex pt-16 min-h-screen">
        {/* Sidebar Navigation */}
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
                   <span className="w-5 h-5 rounded-full bg-warning text-warning-foreground flex items-center justify-center text-xs font-bold shadow-sm">
                     {tab.badge}
                   </span>
                 )}
               </button>
             ))}
           </div>
           
           <div className="mt-auto pt-6 border-t">
             <div className="flex items-center gap-3 px-3 py-3">
               <Avatar className="w-10 h-10 border-2 border-primary/20">
                 <AvatarFallback className="bg-primary/10 text-primary">AO</AvatarFallback>
               </Avatar>
               <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-medium truncate">Amara Okonkwo</p>
                 <p className="text-xs text-muted-foreground truncate">Talent Account</p>
               </div>
               <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={handleLogout}>
                 <LogOut className="w-4 h-4" />
               </Button>
             </div>
           </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
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
                   <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
                 </Button>
               </div>
            </div>

            {activeTab === "overview" && (
              <>
                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat) => (
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
                       <CardTitle>Active Jobs</CardTitle>
                       <CardDescription>Ongoing projects requiring your attention.</CardDescription>
                     </div>
                     <Button variant="ghost" className="gap-1 text-primary" onClick={() => setActiveTab("jobs")}>
                       View All <ChevronRight className="w-4 h-4" />
                     </Button>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-4">
                       {activeJobs.map((job) => (
                         <div key={job.id} className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors bg-card/50">
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                             <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                 <Mic className="w-6 h-6 text-primary" />
                               </div>
                               <div>
                                 <h4 className="font-semibold text-foreground">{job.name}</h4>
                                 <p className="text-sm text-muted-foreground">{job.client} • {job.wordCount} words</p>
                               </div>
                             </div>
                             <div className="flex items-center gap-4">
                               <div className="text-right hidden md:block">
                                 <p className="text-sm font-medium text-foreground">${job.amount}</p>
                                 <p className="text-xs text-muted-foreground">Earnings</p>
                               </div>
                               <Badge className={`${statusConfig[job.status as keyof typeof statusConfig].color} px-3 py-1 rounded-full capitalize`}>
                                 {statusConfig[job.status as keyof typeof statusConfig].label}
                               </Badge>
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-3">
                             <span className="text-xs font-medium text-muted-foreground w-16">Progress</span>
                             <Progress value={job.progress} className="h-2" />
                             <span className="text-xs font-medium text-foreground w-8 text-right">{job.progress}%</span>
                           </div>
                         </div>
                       ))}
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

            {activeTab !== "overview" && activeTab !== "jobs" && activeTab !== "messages" && activeTab !== "earnings" && activeTab !== "profile" && activeTab !== "settings" && (
                <div className="bg-card rounded-xl p-8 border border-border shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Settings className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md">This section ({activeTab}) is currently under development.</p>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TalentDashboard;
