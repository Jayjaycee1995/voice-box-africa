import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  Search, 
  Bell,
  Menu,
  MoreVertical,
  CheckCircle2,
  XCircle,
  TrendingUp,
  DollarSign,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/useAuthStore";
import voiboxLogo from "@/assets/voibox-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock Data
const stats = [
  { label: "Total Revenue", value: "$45,231", icon: DollarSign, change: "+20.1%", trend: "up" },
  { label: "Active Users", value: "2,350", icon: Users, change: "+180", trend: "up" },
  { label: "Active Gigs", value: "1,203", icon: FileText, change: "+19%", trend: "up" },
  { label: "Disputes", value: "12", icon: ShieldAlert, change: "-4%", trend: "down" },
];

const recentUsers = [
  { id: 1, name: "Amara Okonkwo", role: "talent", status: "verified", date: "2 mins ago" },
  { id: 2, name: "John Doe", role: "client", status: "active", date: "1 hour ago" },
  { id: 3, name: "Chinedu A.", role: "talent", status: "pending", date: "3 hours ago" },
  { id: 4, name: "Acme Corp", role: "client", status: "active", date: "5 hours ago" },
  { id: 5, name: "Sarah Smith", role: "talent", status: "rejected", date: "1 day ago" },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "gigs", label: "Gigs & Proposals", icon: FileText },
    { id: "disputes", label: "Disputes", icon: ShieldAlert },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-navy text-white transition-all duration-300 flex flex-col hidden md:flex`}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <img 
              src={voiboxLogo} 
              className="h-8 w-auto transition-all duration-300 hover:scale-105" 
              alt="VoiceBox"
            />
            {sidebarOpen && <span className="font-heading font-bold text-lg tracking-tight">VOICEBOX</span>}
          </Link>
        </div>

        <ScrollArea className="flex-1 py-6">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? "bg-primary text-white" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-white/10">
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-background border-b flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
               <Menu className="w-5 h-5" />
             </Button>
             <h2 className="text-lg font-semibold capitalize">{activeTab}</h2>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 w-64 bg-muted/50" />
             </div>
             <Button variant="ghost" size="icon" className="relative">
               <Bell className="w-5 h-5" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
             </Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-4">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profile_image} />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block text-sm font-medium">Admin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               {/* Stats Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {stats.map((stat) => (
                   <Card key={stat.label}>
                     <CardContent className="p-6">
                       <div className="flex items-center justify-between mb-4">
                         <div className={`p-3 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                           <stat.icon className="w-5 h-5" />
                         </div>
                         <Badge variant={stat.trend === 'up' ? 'default' : 'destructive'} className="gap-1">
                           {stat.change} 
                           <TrendingUp className={`w-3 h-3 ${stat.trend === 'down' && 'rotate-180'}`} />
                         </Badge>
                       </div>
                       <div className="space-y-1">
                         <p className="text-sm text-muted-foreground">{stat.label}</p>
                         <h3 className="text-2xl font-bold">{stat.value}</h3>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Activity Chart Placeholder */}
                 <Card className="lg:col-span-2">
                   <CardHeader>
                     <CardTitle>Platform Activity</CardTitle>
                     <CardDescription>User registrations and Gig postings over time</CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="h-[300px] w-full bg-muted/20 rounded-lg flex items-center justify-center border border-dashed">
                       <div className="text-center text-muted-foreground">
                          <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>Activity Chart Visualization</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 {/* Recent Users */}
                 <Card>
                   <CardHeader>
                     <CardTitle>Recent Registrations</CardTitle>
                     <CardDescription>Latest users joining the platform</CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-4">
                       {recentUsers.map((u) => (
                         <div key={u.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9">
                                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{u.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={`
                              ${u.status === 'verified' && 'bg-green-100 text-green-700 border-green-200'}
                              ${u.status === 'active' && 'bg-blue-100 text-blue-700 border-blue-200'}
                              ${u.status === 'pending' && 'bg-yellow-100 text-yellow-700 border-yellow-200'}
                              ${u.status === 'rejected' && 'bg-red-100 text-red-700 border-red-200'}
                            `}>
                              {u.status}
                            </Badge>
                         </div>
                       ))}
                     </div>
                   </CardContent>
                 </Card>
               </div>
            </div>
          )}

          {activeTab === 'users' && (
             <Card className="animate-in fade-in duration-500">
               <CardHeader>
                 <CardTitle>User Management</CardTitle>
                 <CardDescription>Manage clients and talents.</CardDescription>
               </CardHeader>
               <CardContent>
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>User</TableHead>
                       <TableHead>Role</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead>Joined</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {recentUsers.map((u) => (
                       <TableRow key={u.id}>
                         <TableCell className="font-medium">
                           <div className="flex items-center gap-2">
                             <Avatar className="w-8 h-8"><AvatarFallback>{u.name.charAt(0)}</AvatarFallback></Avatar>
                             {u.name}
                           </div>
                         </TableCell>
                         <TableCell className="capitalize">{u.role}</TableCell>
                         <TableCell>
                           <Badge variant="secondary" className="capitalize">{u.status}</Badge>
                         </TableCell>
                         <TableCell>{u.date}</TableCell>
                         <TableCell className="text-right">
                           <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </CardContent>
             </Card>
          )}

          {/* Other tabs can be implemented similarly */}
          {(activeTab === 'gigs' || activeTab === 'disputes' || activeTab === 'settings') && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground animate-in fade-in duration-500">
               <Settings className="w-12 h-12 mb-4 opacity-20" />
               <h3 className="text-lg font-medium">Coming Soon</h3>
               <p>This module is under development.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
