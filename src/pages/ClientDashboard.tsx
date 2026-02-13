import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  DollarSign,
  Clock,
  CheckCircle2,
  ChevronRight,
  Calendar,
  Star,
  Search,
  Filter,
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

type TabType = "overview" | "projects" | "messages" | "payments" | "settings";

const recentProjects = [
  { id: "1", name: "MTN Commercial - Lagos", artist: "Amara Okonkwo", artistAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face", status: "in_progress", amount: 75.0, deadline: "Dec 20, 2024" },
  { id: "2", name: "E-learning Module 3", artist: "Kwame Mensah", artistAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", status: "delivered", amount: 120.0, deadline: "Dec 18, 2024" },
  { id: "3", name: "Radio Jingle - Coca-Cola", artist: "Zainab Ahmed", artistAvatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&h=100&fit=crop&crop=face", status: "completed", amount: 200.0, deadline: "Dec 15, 2024" },
];

const messages = [
  { id: "1", from: "Amara Okonkwo", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face", message: "I've uploaded the first draft. Please review!", time: "2 hours ago", unread: true },
  { id: "2", from: "Kwame Mensah", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", message: "Thanks for the feedback. Revision is ready.", time: "1 day ago", unread: false },
];

const chartData = [
  { name: 'Jan', spent: 400 },
  { name: 'Feb', spent: 300 },
  { name: 'Mar', spent: 600 },
  { name: 'Apr', spent: 800 },
  { name: 'May', spent: 500 },
  { name: 'Jun', spent: 1245 },
];

const statusConfig = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  delivered: { label: "Delivered", color: "bg-purple-100 text-purple-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
};

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "My Projects", icon: FileText },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: 1 },
    { id: "payments", label: "Payments", icon: DollarSign },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const stats = [
    { label: "Active Projects", value: "3", icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Spent", value: "$1,245", icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { label: "Completed", value: "12", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Avg. Rating", value: "4.8", icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" },
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
                 <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
               </Avatar>
               <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-medium truncate">John Doe</p>
                 <p className="text-xs text-muted-foreground truncate">Client Account</p>
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
                 <p className="text-muted-foreground mt-1">Welcome back, here's what's happening today.</p>
               </div>
               <div className="flex items-center gap-3">
                 <Button variant="outline" size="icon" className="rounded-full relative">
                   <Bell className="w-5 h-5 text-muted-foreground" />
                   <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
                 </Button>
                 <Button className="btn-gradient shadow-lg" asChild>
                   <Link to="/post-gig"><Plus className="w-4 h-4 mr-2" />Post a Project</Link>
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
                           {messages.map((msg) => (
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
                           ))}
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
                       {recentProjects.map((project) => (
                         <div key={project.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors bg-card/50">
                           <div className="flex items-center gap-4">
                             <Avatar className="w-12 h-12 rounded-lg">
                               <AvatarImage src={project.artistAvatar} />
                               <AvatarFallback>VO</AvatarFallback>
                             </Avatar>
                             <div>
                               <h4 className="font-semibold text-foreground">{project.name}</h4>
                               <p className="text-sm text-muted-foreground">Talent: {project.artist}</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-6">
                             <div className="text-right">
                               <p className="text-sm font-medium text-foreground">${project.amount}</p>
                               <p className="text-xs text-muted-foreground">Budget</p>
                             </div>
                             <div className="text-right">
                               <p className="text-sm font-medium text-foreground">{project.deadline}</p>
                               <p className="text-xs text-muted-foreground">Deadline</p>
                             </div>
                             <Badge className={`${statusConfig[project.status as keyof typeof statusConfig].color} px-3 py-1 rounded-full capitalize`}>
                               {statusConfig[project.status as keyof typeof statusConfig].label}
                             </Badge>
                             <Button variant="ghost" size="icon">
                               <MoreVertical className="w-4 h-4 text-muted-foreground" />
                             </Button>
                           </div>
                         </div>
                       ))}
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
