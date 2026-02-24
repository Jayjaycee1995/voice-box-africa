import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Search,
  Bell,
  Menu,
  Trash2,
  Activity,
  Mic,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import voiboxLogo from "@/assets/voibox-logo.png";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<{ id: string; name: string } | null>(null);
  const [stats, setStats] = useState([
    { label: "Total Users", value: "0", icon: Users, color: "bg-blue-100 text-blue-700" },
    { label: "Clients", value: "0", icon: FileText, color: "bg-purple-100 text-purple-700" },
    { label: "Talents", value: "0", icon: Mic, color: "bg-green-100 text-green-700" },
    { label: "Open Gigs", value: "0", icon: Activity, color: "bg-yellow-100 text-yellow-700" },
  ]);
  const [recentUsers, setRecentUsers] = useState<
    Array<{ id: string; name: string; email: string; role: string; created_at: string; profile_image: string | null }>
  >([]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/", { replace: true });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const json = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to delete user");
      }

      // Remove from local state
      setRecentUsers((prev) => prev.filter((u) => u.id !== userId));
      setStats((prev) =>
        prev.map((s) => {
          if (s.label === "Total Users") return { ...s, value: String(Number(s.value) - 1) };
          return s;
        })
      );

      toast({ title: "User deleted", description: "The user has been permanently removed." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setDeletingUserId(null);
      setConfirmDeleteUser(null);
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchAsync = async () => {
      setIsLoading(true);

      try {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name, email, role, created_at, profile_image")
          .order("created_at", { ascending: false })
          .limit(20);

        if (usersError) throw usersError;

        const users = (usersData ?? []) as Array<{
          id: string;
          name: string | null;
          email: string;
          role: "client" | "talent" | "admin";
          created_at: string;
          profile_image: string | null;
        }>;

        const clients = users.filter((u) => u.role === "client").length;
        const talents = users.filter((u) => u.role === "talent").length;

        const { data: gigsData, error: gigsError } = await supabase
          .from("gigs")
          .select("id, status");

        if (gigsError) throw gigsError;

        const gigs = (gigsData ?? []) as Array<{ id: number; status: "open" | "assigned" | "completed" | "cancelled" }>;
        const openGigs = gigs.filter((g) => g.status === "open").length;

        if (!isMounted) return;
        setRecentUsers(users.map((u) => ({
          id: u.id,
          name: u.name || u.email,
          email: u.email,
          role: u.role,
          created_at: u.created_at,
          profile_image: u.profile_image,
        })));

        setStats([
          { label: "Total Users", value: String(users.length), icon: Users, color: "bg-blue-100 text-blue-700" },
          { label: "Clients", value: String(clients), icon: FileText, color: "bg-purple-100 text-purple-700" },
          { label: "Talents", value: String(talents), icon: Mic, color: "bg-green-100 text-green-700" },
          { label: "Open Gigs", value: String(openGigs), icon: Activity, color: "bg-yellow-100 text-yellow-700" },
        ]);
      } catch (e) {
        if (!isMounted) return;
        setRecentUsers([]);
        setStats([
          { label: "Total Users", value: "0", icon: Users, color: "bg-blue-100 text-blue-700" },
          { label: "Clients", value: "0", icon: FileText, color: "bg-purple-100 text-purple-700" },
          { label: "Talents", value: "0", icon: Mic, color: "bg-green-100 text-green-700" },
          { label: "Open Gigs", value: "0", icon: Activity, color: "bg-yellow-100 text-yellow-700" },
        ]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAsync();

    return () => {
      isMounted = false;
    };
  }, []);

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
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors">
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
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
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
                         <div className={`p-3 rounded-full ${stat.color}`}>
                           <stat.icon className="w-5 h-5" />
                         </div>
                       </div>
                       <div className="space-y-1">
                         <p className="text-sm text-muted-foreground">{stat.label}</p>
                         <h3 className="text-2xl font-bold">{stat.value}</h3>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>

               <div className="grid grid-cols-1 gap-6">
                 <Card>
                   <CardHeader>
                     <CardTitle>Recent Registrations</CardTitle>
                     <CardDescription>Latest users joining the platform</CardDescription>
                   </CardHeader>
                   <CardContent>
                     {isLoading ? (
                       <div className="py-6 text-center text-muted-foreground">Loading...</div>
                     ) : recentUsers.length === 0 ? (
                       <div className="py-6 text-center text-muted-foreground">No users found.</div>
                     ) : (
                       <div className="space-y-4">
                         {recentUsers.slice(0, 5).map((u) => (
                           <div key={u.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                             <div className="flex items-center gap-3">
                               <Avatar className="w-9 h-9">
                                 <AvatarImage src={u.profile_image || undefined} />
                                 <AvatarFallback>{u.name.charAt(0).toUpperCase()}</AvatarFallback>
                               </Avatar>
                               <div>
                                 <p className="text-sm font-medium">{u.name}</p>
                                 <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
                               </div>
                             </div>
                             <Badge variant="secondary" className="capitalize">{u.role}</Badge>
                           </div>
                         ))}
                       </div>
                     )}
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
                       <TableHead>Joined</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                    {recentUsers.map((u) => (
                       <TableRow key={u.id}>
                         <TableCell className="font-medium">
                           <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={u.profile_image || undefined} />
                              <AvatarFallback>{u.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="truncate">{u.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                            </div>
                           </div>
                         </TableCell>
                         <TableCell className="capitalize">{u.role}</TableCell>
                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                         <TableCell className="text-right">
                           <Button
                             variant="ghost"
                             size="icon"
                             className="text-muted-foreground hover:text-destructive"
                             disabled={deletingUserId === u.id || u.id === user?.id}
                             onClick={() => setConfirmDeleteUser({ id: u.id, name: u.name })}
                           >
                             {deletingUserId === u.id ? (
                               <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                             ) : (
                               <Trash2 className="w-4 h-4" />
                             )}
                           </Button>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </CardContent>
             </Card>
          )}

          {/* Other tabs can be implemented similarly */}
        </main>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!confirmDeleteUser}
        onOpenChange={(open) => { if (!open) setConfirmDeleteUser(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete user account
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{confirmDeleteUser?.name}</strong> and all their
              associated data (messages, proposals, gigs, demos). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDeleteUser && handleDeleteUser(confirmDeleteUser.id)}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
