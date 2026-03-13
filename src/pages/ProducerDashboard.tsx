import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { User, ProductionAssignment, Gig } from "@/lib/database.types";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, DollarSign, Clock, CheckCircle2, AlertCircle, Music } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type AssignmentWithDetails = ProductionAssignment & {
  gig?: Gig & { client?: User };
};

export default function ProducerDashboard() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [producerProfile, setProducerProfile] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalEarned: 0,
    completedProjects: 0,
    averageRating: 0,
    activeTasks: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchProducerData = async () => {
      setIsLoading(true);
      try {
        // Fetch producer profile
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setProducerProfile(profile);

        // Fetch production assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("production_assignments")
          .select(
            `
            *,
            gig:gigs(
              *,
              client:users(id, name, email, profile_image)
            )
          `
          )
          .eq("producer_id", user.id)
          .order("created_at", { ascending: false });

        if (assignmentsError) throw assignmentsError;
        setAssignments(assignmentsData as unknown as AssignmentWithDetails[]);

        // Calculate stats
        const completed = assignmentsData?.filter(
          (a) => a.status === "completed"
        ).length || 0;
        const active = assignmentsData?.filter(
          (a) => a.status === "in_progress"
        ).length || 0;
        const totalEarned = assignmentsData?.reduce(
          (acc, a) => acc + (a.rate_amount || 0),
          0
        ) || 0;

        setStats({
          totalEarned,
          completedProjects: completed,
          averageRating: 4.8, // TODO: Fetch from ratings table
          activeTasks: active,
        });
      } catch (error) {
        console.error("Error fetching producer data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducerData();
  }, [user]);

  const handleAcceptAssignment = async (assignmentId: number) => {
    try {
      const { error } = await supabase
        .from("production_assignments")
        .update({ status: "accepted" })
        .eq("id", assignmentId);

      if (error) throw error;

      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId ? { ...a, status: "accepted" } : a
        )
      );

      toast.success("Assignment accepted!");
    } catch (error) {
      console.error("Error accepting assignment:", error);
      toast.error("Failed to accept assignment");
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      accepted: "bg-blue-100 text-blue-700",
      in_progress: "bg-purple-100 text-purple-700",
      revision_requested: "bg-orange-100 text-orange-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const statsCards = [
    {
      label: "Total Earned",
      value: `$${stats.totalEarned.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Completed",
      value: stats.completedProjects.toString(),
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Active Tasks",
      value: stats.activeTasks.toString(),
      icon: Music,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Avg. Rating",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="pt-24 px-4 md:px-8 pb-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-foreground">
            Producer Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your production assignments and grow your portfolio.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold font-heading">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Producer Profile Summary */}
        {producerProfile && (
          <Card className="mb-8 border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={producerProfile.profile_image} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {producerProfile.name?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{producerProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {producerProfile.bio || "No bio added yet"}
                  </p>
                  {producerProfile.producer_skills && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {producerProfile.producer_skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Rate</p>
                  <p className="text-xl font-semibold text-green-600">
                    ${producerProfile.production_rate_per_hour}/hr
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assignments */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Production Assignments</CardTitle>
            <CardDescription>
              {assignments.length} total assignment{assignments.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No assignments yet</p>
                <p className="text-sm text-muted-foreground">
                  Assignments will appear here when clients select you for their projects.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                      {/* Gig & Client Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div>
                            <h4 className="font-semibold">{assignment.gig?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Client: {assignment.gig?.client?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Type</p>
                            <p className="font-medium capitalize">
                              {assignment.assignment_type.replace(/_/g, " ")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Budget</p>
                            <p className="font-medium text-green-600">
                              ${assignment.rate_amount || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Deadline</p>
                            <p className="font-medium">
                              {assignment.gig?.deadline
                                ? format(new Date(assignment.gig.deadline), "MMM dd, yyyy")
                                : "TBD"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="md:w-48 flex flex-col gap-2">
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace(/_/g, " ")}
                        </Badge>

                        {assignment.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                handleAcceptAssignment(assignment.id)
                              }
                            >
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              Decline
                            </Button>
                          </div>
                        )}

                        {assignment.status === "accepted" && (
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            Start Production
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
