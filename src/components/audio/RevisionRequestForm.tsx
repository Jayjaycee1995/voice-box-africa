import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, MessageCircle, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface RevisionRequestProps {
  gigId: number;
  deliverableId: number;
  producerId: string;
  audioFileName?: string;
  onRevisionSuccess?: () => void;
}

export default function RevisionRequestForm({
  gigId,
  deliverableId,
  producerId,
  audioFileName = "Audio File",
  onRevisionSuccess,
}: RevisionRequestProps) {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSubmitRevision = async () => {
    if (!feedback.trim()) {
      toast.error("Please provide feedback for the revision");
      return;
    }

    setIsLoading(true);
    try {
      // Update audio deliverable status to pending_revision
      const { error: updateError } = await supabase
        .from("audio_deliverables")
        .update({
          status: "pending_revision",
          feedback: feedback,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deliverableId);

      if (updateError) throw updateError;

      // Create revision record in messages or use feedback directly
      const { error: createError } = await supabase
        .from("messages")
        .insert({
          sender_id: user?.id,
          receiver_id: producerId,
          content: `Revision request for deliverable: ${audioFileName}\n\nFeedback: ${feedback}`,
        });

      if (createError) throw createError;

      toast.success("Revision request sent to producer!");
      setFeedback("");
      setIsOpen(false);

      if (onRevisionSuccess) {
        onRevisionSuccess();
      }
    } catch (error) {
      console.error("Error submitting revision:", error);
      toast.error("Failed to submit revision request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <MessageCircle className="w-4 h-4" />
          Request Revision
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Audio Revision</DialogTitle>
          <DialogDescription>
            Provide detailed feedback to the producer on what needs to be changed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Audio File Info */}
          <Card className="bg-muted/50 border-none">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Audio File</p>
                <p className="text-sm font-medium">{audioFileName}</p>
              </div>
              <Badge variant="outline">To Revise</Badge>
            </CardContent>
          </Card>

          {/* Feedback Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Revision Feedback</label>
            <Textarea
              placeholder="Describe what needs to be changed. Be specific about:
- Levels/volume issues
- EQ adjustments needed
- Effects or processing
- Any other technical notes"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isLoading}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              {feedback.length}/500 characters
            </p>
          </div>

          {/* Tips */}
          <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-xs space-y-1">
            <p className="font-medium">💡 Pro Tips:</p>
            <ul className="space-y-0.5 ml-2">
              <li>• Use reference tracks if applicable</li>
              <li>• Be specific about timing of issues</li>
              <li>• Include technical details (dB levels, frequencies)</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRevision}
              disabled={isLoading || !feedback.trim()}
              className="flex-1 btn-gradient"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
