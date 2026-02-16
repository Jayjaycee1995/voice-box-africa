import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, MessageSquare, CheckCircle, XCircle, Clock4, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

interface Invitation {
  id: string | number;
  client_id: string | number;
  talent_id: string | number;
  gig_id: string | number;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  talent?: {
    id: string | number;
    name: string;
    profile_image: string;
  };
  client?: {
    id: string | number;
    name: string;
    profile_image: string;
  };
  gig: {
    id: string | number;
    title: string;
    budget: number;
  };
}

const Invitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const fetchInvitations = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          gig:gigs(id, title, budget),
          client:client_id(id, name, profile_image),
          talent:talent_id(id, name, profile_image)
        `)
        .or(`client_id.eq.${user.id},talent_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match Invitation interface structure if needed
      // But based on select query, it should match the structure expected by the UI
      // providing we cast it properly or the interface is flexible enough
      setInvitations(data as unknown as Invitation[]);
    } catch (error) {
      console.error("Failed to fetch invitations", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleAction = async (id: string | number, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: `Invitation ${status}` });
      fetchInvitations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update invitation", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock4 className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Accepted
        </Badge>;
      case "declined":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Declined
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isTalent = user?.role === 'talent';

  const pendingInvitations = invitations.filter(inv => inv.status === "pending");
  const acceptedInvitations = invitations.filter(inv => inv.status === "accepted");
  const declinedInvitations = invitations.filter(inv => inv.status === "declined");

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              {isTalent ? "My Invitations" : "Sent Invitations"}
            </h1>
            <p className="text-muted-foreground">
              {isTalent ? "Manage invitations you've received" : "Manage invitations you've sent to voice talents"}
            </p>
          </div>

          {isLoading ? (
             <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({invitations.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingInvitations.length})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({acceptedInvitations.length})</TabsTrigger>
              <TabsTrigger value="declined">Declined ({declinedInvitations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {invitations.map((invitation) => (
                <InvitationCard 
                  key={invitation.id} 
                  invitation={invitation} 
                  onAction={handleAction} 
                  isTalent={isTalent}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                />
              ))}
              
              {invitations.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No invitations</h3>
                    <p className="text-muted-foreground">
                      {isTalent ? "You haven't received any invitations yet." : "Start inviting voice talents to your projects."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingInvitations.map((invitation) => (
                <InvitationCard 
                  key={invitation.id} 
                  invitation={invitation} 
                  onAction={handleAction} 
                  isTalent={isTalent}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                />
              ))}
              
              {pendingInvitations.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No pending invitations</h3>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="accepted" className="space-y-4">
              {acceptedInvitations.map((invitation) => (
                <InvitationCard 
                  key={invitation.id} 
                  invitation={invitation} 
                  onAction={handleAction} 
                  isTalent={isTalent}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                />
              ))}
              
              {acceptedInvitations.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No accepted invitations</h3>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="declined" className="space-y-4">
              {declinedInvitations.map((invitation) => (
                <InvitationCard 
                  key={invitation.id} 
                  invitation={invitation} 
                  onAction={handleAction} 
                  isTalent={isTalent}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                />
              ))}
              
              {declinedInvitations.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No declined invitations</h3>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

interface InvitationCardProps {
  invitation: Invitation;
  onAction: (id: string | number, status: 'accepted' | 'declined') => void;
  isTalent: boolean;
  getStatusBadge: (status: string) => React.ReactNode;
  formatDate: (date: string | null) => string;
}

const InvitationCard = ({ invitation, onAction, isTalent, getStatusBadge, formatDate }: InvitationCardProps) => {
  const displayUser = isTalent ? invitation.client : invitation.talent;
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
               {displayUser?.profile_image ? (
                 <img
                   src={displayUser.profile_image}
                   alt={displayUser.name}
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <User className="w-full h-full p-2 text-muted-foreground" />
               )}
            </div>
            <div>
              <CardTitle className="text-lg">{displayUser?.name || 'Unknown User'}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <User className="w-3 h-3" />
                {isTalent ? "Client" : "Voice Talent"}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(invitation.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-foreground mb-1">{invitation.gig.title}</h4>
          <p className="text-sm text-muted-foreground">Budget: ${invitation.gig.budget}</p>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground italic">"{invitation.message}"</p>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Sent: {formatDate(invitation.created_at)}
            </div>
          </div>

          {isTalent && invitation.status === "pending" && (
            <div className="flex gap-2">
              <Button size="sm" variant="default" onClick={() => onAction(invitation.id, 'accepted')}>
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => onAction(invitation.id, 'declined')}>
                Decline
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Invitations;
