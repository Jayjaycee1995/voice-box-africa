import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { AudioDeliverable, Gig, User } from "@/lib/database.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface RevisionWithDetails extends AudioDeliverable {
  gig?: Gig & { client?: User };
  producer?: User;
}

export default function RevisionRequestList() {
  const { user } = useAuthStore();
  const [revisions, setRevisions] = useState<RevisionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<RevisionWithDetails | null>(
    null
  );
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchRevisions();
  }, [user]);

  const fetchRevisions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("audio_deliverables")
        .select(
          `
          *,
          gig:gigs(
            *,
            client:users(id, name, email, profile_image)
          ),
          producer:users(id, name, email, profile_image)
        `
        )
        .eq("producer_id", user.id)
        .eq("status", "pending_revision")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRevisions(data as unknown as RevisionWithDetails[]);
    } catch (error) {
      console.error("Error fetching revisions:", error);
      toast.error("Failed to load revision requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRevision = async () => {
    if (!selectedRevision || !revisionNotes.trim()) {
      toast.error("Please provide revision notes");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create new audio deliverable with status "pending" (for re-approval)
      const { error: insertError } = await supabase
        .from("audio_deliverables")
        .insert({
          gig_id: selectedRevision.gig_id,
          producer_id: user?.id,
          audio_type: "revision" as const,
          file_url: selectedRevision.file_url, // Would normally be replaced with new upload
          version_number: (selectedRevision.version_number || 1) + 1,
          status: "pending",
          feedback: revisionNotes,
          created_by: user?.id,
        });

      if (insertError) throw insertError;

      // Update original as approved (revision complete)
      const { error: updateError } = await supabase
        .from("audio_deliverables")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRevision.id);

      if (updateError) throw updateError;

      // Send notification to client
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: user?.id,
          receiver_id: selectedRevision.gig?.client_id,
          content: `Revision complete for "${selectedRevision.gig?.title}". ${revisionNotes}`,
        });

      if (messageError) console.error("Error sending notification:", messageError);

      toast.success("Revision submitted successfully!");
      setSelectedRevision(null);
      setRevisionNotes("");
      fetchRevisions();
    } catch (error) {
      console.error("Error submitting revision:", error);
      toast.error("Failed to submit revision");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (revisions.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No revision requests</h3>
          <p className="text-muted-foreground">
            You're all caught up! No pending revisions at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Revision Requests</h2>
          <p className="text-sm text-muted-foreground">
            {revisions.length} pending revision{revisions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Badge className="bg-orange-100 text-orange-700">
          {revisions.length} Pending
        </Badge>
      </div>

      {revisions.map((revision) => (
        <Card
          key={revision.id}
          className="border-none shadow-sm hover:shadow-md transition-all"
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {revision.gig?.title}
                  <Badge variant="outline" className="text-xs">
                    {revision.audio_type}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  From {revision.gig?.client?.name} •{" "}
                  {format(new Date(revision.created_at), "MMM dd, yyyy")}
                </CardDescription>
              </div>
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={revision.gig?.client?.profile_image} />
                <AvatarFallback>
                  {revision.gig?.client?.name?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Revision Feedback */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
              <p className="text-sm font-medium text-orange-900">Client Feedback:</p>
              <p className="text-sm text-orange-800 whitespace-pre-wrap">
                {revision.feedback || "No feedback provided"}
              </p>
            </div>

            {/* Original Audio Info */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Original Audio</p>
              <a
                href={revision.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Listen to original version
                <Upload className="w-3 h-3" />
              </a>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => setSelectedRevision(revision)}
              className="w-full btn-gradient"
              size="lg"
            >
              Submit Revised Version
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Revision Submission Dialog */}
      <Dialog open={!!selectedRevision} onOpenChange={(open) => !open && setSelectedRevision(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Revised Audio</DialogTitle>
            <DialogDescription>
              Upload your revised version and add notes explaining the changes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Project Info */}
            <Card className="bg-muted/50 border-none">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Project</p>
                <p className="text-sm font-medium">{selectedRevision?.gig?.title}</p>
              </CardContent>
            </Card>

            {/* Upload Area (Placeholder) */}
            <div className="p-6 border-2 border-dashed rounded-lg bg-muted/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload revised audio</p>
              <p className="text-xs text-muted-foreground">MP3, WAV, FLAC (Max 50MB)</p>
            </div>

            {/* Revision Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">What changed?</label>
              <Textarea
                placeholder="Describe the changes you made to address the feedback..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[80px]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedRevision(null)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRevision}
                disabled={isSubmitting || !revisionNotes.trim()}
                className="flex-1 btn-gradient"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Submit Revision
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
