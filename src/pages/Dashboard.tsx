import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  User,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  ChevronRight,
  TrendingUp,
  Calendar,
  Star,
} from "lucide-react";

type TabType = "overview" | "projects" | "messages" | "settings";

// Mock data
const recentProjects = [
  {
    id: "1",
    name: "MTN Commercial - Lagos",
    artist: "Amara Okonkwo",
    artistAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face",
    status: "in_progress",
    amount: 75.0,
    deadline: "Dec 20, 2024",
  },
  {
    id: "2",
    name: "E-learning Module 3",
    artist: "Kwame Mensah",
    artistAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    status: "delivered",
    amount: 120.0,
    deadline: "Dec 18, 2024",
  },
  {
    id: "3",
    name: "Radio Jingle - Coca-Cola",
    artist: "Zainab Ahmed",
    artistAvatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&h=100&fit=crop&crop=face",
    status: "completed",
    amount: 200.0,
    deadline: "Dec 15, 2024",
  },
];

const messages = [
  {
    id: "1",
    from: "Amara Okonkwo",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face",
    message: "I've uploaded the first draft. Please review and let me know if you need any changes!",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    from: "Kwame Mensah",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    message: "Thanks for the feedback. The revision is ready for your review.",
    time: "1 day ago",
    unread: false,
  },
];

const statusConfig = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", color: "bg-secondary/20 text-secondary" },
  delivered: { label: "Delivered", color: "bg-primary/20 text-primary" },
  completed: { label: "Completed", color: "bg-accent/20 text-accent" },
  cancelled: { label: "Cancelled", color: "bg-destructive/20 text-destructive" },
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: FileText },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: 1 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const stats = [
    {
      label: "Active Projects",
      value: "3",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Spent",
      value: "$1,245",
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Completed",
      value: "12",
      icon: CheckCircle2,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      label: "Avg. Rating Given",
      value: "4.8",
      icon: Star,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <main className="pt-20 md:pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Welcome back, John! 👋
            </h1>
            <p className="text-muted-foreground">
              Manage your voice-over projects and communications.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-4 shadow-card sticky top-24">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            activeTab === tab.id
                              ? "bg-primary-foreground text-primary"
                              : "bg-destructive text-destructive-foreground"
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-border">
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link to="/artists">
                      <Play className="w-4 h-4" />
                      Book New Project
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <>
                  {/* Stats Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className="bg-card rounded-xl p-4 shadow-card"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Projects */}
                  <div className="bg-card rounded-2xl p-6 shadow-card">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-serif text-lg font-semibold text-foreground">
                        Recent Projects
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => setActiveTab("projects")}
                      >
                        View all
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {recentProjects.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <img
                            src={project.artistAvatar}
                            alt={project.artist}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">
                              {project.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {project.artist}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={`${
                                statusConfig[project.status as keyof typeof statusConfig].color
                              } border-0`}
                            >
                              {statusConfig[project.status as keyof typeof statusConfig].label}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              ${project.amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Messages */}
                  <div className="bg-card rounded-2xl p-6 shadow-card">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-serif text-lg font-semibold text-foreground">
                        Recent Messages
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => setActiveTab("messages")}
                      >
                        View all
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                            msg.unread ? "bg-primary/5 hover:bg-primary/10" : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          <div className="relative">
                            <img
                              src={msg.avatar}
                              alt={msg.from}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {msg.unread && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-destructive border-2 border-card" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-medium text-foreground">{msg.from}</h4>
                              <span className="text-xs text-muted-foreground">{msg.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Projects Tab */}
              {activeTab === "projects" && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-xl font-semibold text-foreground">
                      All Projects
                    </h2>
                    <Button asChild>
                      <Link to="/artists">New Project</Link>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {recentProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                      >
                        <img
                          src={project.artistAvatar}
                          alt={project.artist}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground mb-1">
                            {project.name}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{project.artist}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {project.deadline}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={`${
                              statusConfig[project.status as keyof typeof statusConfig].color
                            } border-0 mb-2`}
                          >
                            {statusConfig[project.status as keyof typeof statusConfig].label}
                          </Badge>
                          <p className="font-semibold text-foreground">
                            ${project.amount.toFixed(2)}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === "messages" && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                    Messages
                  </h2>

                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                          msg.unread
                            ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={msg.avatar}
                          alt={msg.from}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{msg.from}</h4>
                            <span className="text-xs text-muted-foreground">{msg.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {msg.message}
                          </p>
                        </div>
                        {msg.unread && (
                          <span className="w-3 h-3 rounded-full bg-destructive shrink-0 mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                    Account Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-border">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">John Doe</h4>
                        <p className="text-sm text-muted-foreground">john@company.com</p>
                      </div>
                      <Button variant="outline">Edit Profile</Button>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-medium text-foreground">Quick Links</h3>
                      {[
                        { label: "Payment Methods", icon: DollarSign },
                        { label: "Notification Preferences", icon: MessageSquare },
                        { label: "Security Settings", icon: Settings },
                      ].map((item, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium text-foreground">{item.label}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
