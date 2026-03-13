import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AudioDeliverable } from "@/lib/database.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Music, Download, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import RevisionRequestForm from "./RevisionRequestForm";
import { toast } from "sonner";

interface AudioDeliverableViewerProps {
  gigId: number;
  deliverables?: AudioDeliverable[];
  onDeliverableApprove?: (deliverableId: number) => void;
}

export default function AudioDeliverableViewer({
  gigId,
  deliverables: initialDeliverables,
  onDeliverableApprove,
}: AudioDeliverableViewerProps) {
  const [deliverables, setDeliverables] = useState<AudioDeliverable[]>(initialDeliverables || []);
  const [isLoading, setIsLoading] = useState(!initialDeliverables);
  const [selectedDeliverable, setSelectedDeliverable] = useState<AudioDeliverable | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    if (!initialDeliverables) {
      fetchDeliverables();
    }
  }, [gigId, initialDeliverables]);

  const fetchDeliverables = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("audio_deliverables")
        .select("*")
        .eq("gig_id", gigId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeliverables(data || []);
    } catch (error) {
      console.error("Error fetching deliverables:", error);
      toast.error("Failed to load audio deliverables");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDeliverable = async (deliverableId: number) => {
    setIsApproving(true);
    try {
      const { error } = await supabase
        .from("audio_deliverables")
        .update({
          status: "approved",
          feedback: approvalNotes || "Approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", deliverableId);

      if (error) throw error;

      setDeliverables((prev) =>
        prev.map((d) =>
          d.id === deliverableId ? { ...d, status: "approved" } : d
        )
      );

      setSelectedDeliverable(null);
      setApprovalNotes("");
      toast.success("Audio approved successfully!");

      if (onDeliverableApprove) {
        onDeliverableApprove(deliverableId);
      }
    } catch (error) {
      console.error("Error approving deliverable:", error);
      toast.error("Failed to approve audio");
    } finally {
      setIsApproving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "pending_revision":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Music className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "pending_revision":
        return "bg-orange-100 text-orange-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (deliverables.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="py-12 text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No audio files yet</h3>
          <p className="text-muted-foreground">
            Audio deliverables will appear here once the producer uploads them.
          </p>
        </CardContent>
      </Card>
    );
  }

  const approvedDeliverables = deliverables.filter((d) => d.status === "approved");
  const pendingDeliverables = deliverables.filter(
    (d) => d.status === "pending" || d.status === "pending_revision"
  );

  return (
    <div className="space-y-6">
      {/* Tabs/Sections */}
      {pendingDeliverables.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Awaiting Approval</h3>
            <Badge className="bg-yellow-100 text-yellow-700">
              {pendingDeliverables.length}
            </Badge>
          </div>

          {pendingDeliverables.map((deliverable) => (
            <Card key={deliverable.id} className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(deliverable.status)}
                    <div>
                      <CardTitle className="text-base">
                        {deliverable.audio_type.replace(/_/g, " ")}
                      </CardTitle>
                      <CardDescription>
                        Uploaded {format(new Date(deliverable.created_at), "MMM dd, yyyy")}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(deliverable.status)}>
                    {deliverable.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Audio Player */}
                <div className="bg-muted rounded-lg p-4">
                  <audio
                    controls
                    src={deliverable.file_url}
                    className="w-full"
                    controlsList="nodownload"
                  />
                </div>

                {/* Feedback */}
                {deliverable.feedback && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-900 mb-1">Producer Notes</p>
                    <p className="text-sm text-blue-800">{deliverable.feedback}</p>
                  </div>
                )}

                {/* Actions */}
                {deliverable.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedDeliverable(deliverable);
                        setApprovalNotes("");
                      }}
                      className="flex-1 btn-gradient"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <RevisionRequestForm
                      gigId={gigId}
                      deliverableId={deliverable.id}
                      producerId={deliverable.producer_id || ""}
                      audioFileName={`${deliverable.audio_type}.mp3`}
                      onRevisionSuccess={fetchDeliverables}
                    />
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <a
                        href={deliverable.file_url}
                        download
                        className="flex items-center justify-center"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                )}

                {deliverable.status === "pending_revision" && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      Awaiting producer's revised version based on your feedback.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approved Deliverables */}
      {approvedDeliverables.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Approved Audio</h3>
            <Badge className="bg-green-100 text-green-700">
              {approvedDeliverables.length}
            </Badge>
          </div>

          {approvedDeliverables.map((deliverable) => (
            <Card key={deliverable.id} className="border-none shadow-sm bg-green-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <CardTitle className="text-base">
                        {deliverable.audio_type.replace(/_/g, " ")}
                      </CardTitle>
                      <CardDescription>
                        Approved {format(new Date(deliverable.updated_at), "MMM dd, yyyy")}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Approved</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="bg-background rounded-lg p-4">
                  <audio
                    controls
                    src={deliverable.file_url}
                    className="w-full"
                  />
                </div>

                <Button
                  asChild
                  className="w-full mt-4"
                  variant="outline"
                >
                  <a href={deliverable.file_url} download className="flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download Master
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approval Dialog */}
      {selectedDeliverable && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedDeliverable(null)}
        >
          <Card
            className="w-full max-w-md border-none shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>Approve Audio</CardTitle>
              <CardDescription>
                Are you happy with this audio? Add optional approval notes.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Textarea
                placeholder="Optional approval notes..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                disabled={isApproving}
                className="min-h-[80px]"
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDeliverable(null)}
                  disabled={isApproving}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleApproveDeliverable(selectedDeliverable.id)
                  }
                  disabled={isApproving}
                  className="flex-1 btn-gradient"
                >
                  {isApproving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
