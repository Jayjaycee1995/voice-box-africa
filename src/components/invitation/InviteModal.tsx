import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, X, Send, Loader2 } from "lucide-react";
import { Gig } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistId: string;
  artistName: string;
}

const InviteModal = ({ isOpen, onClose, artistId, artistName }: InviteModalProps) => {
  const [selectedGigId, setSelectedGigId] = useState("");
  const [invitationMessage, setInvitationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoadingGigs, setIsLoadingGigs] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();

  const selectedGig = gigs.find(gig => gig.id.toString() === selectedGigId);

  useEffect(() => {
    const fetchMyGigs = async () => {
      if (!user) return;
      setIsLoadingGigs(true);
      try {
        const { data, error } = await supabase
          .from('gigs')
          .select('*')
          .eq('client_id', user.id)
          .eq('status', 'open');

        if (error) throw error;
        setGigs(data as unknown as Gig[]);
      } catch (error) {
        console.error("Failed to fetch gigs", error);
      } finally {
        setIsLoadingGigs(false);
      }
    };

    if (isOpen) {
      fetchMyGigs();
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGigId) {
      toast({ title: "Error", description: "Please select a project", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Error", description: "You must be logged in to send invitations", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('invitations')
        .insert({
          client_id: user.id,
          talent_id: artistId,
          gig_id: Number(selectedGigId),
          message: invitationMessage,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({ title: "Success", description: `Invitation sent to ${artistName} successfully!` });
      onClose();
      
      setSelectedGigId("");
      setInvitationMessage("");
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send invitation.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateDefaultMessage = () => {
    if (selectedGig) {
      return `Hi ${artistName},\n\nI was impressed by your profile and would like to invite you to work on my project "${selectedGig.title}". Your ${selectedGig.language} accent and ${selectedGig.tone} tone seem like a perfect fit for this project.\n\nLooking forward to hearing from you!`;
    }
    return `Hi ${artistName},\n\nI was impressed by your profile and would like to invite you to work on one of my projects. Your skills and experience seem like a great fit for my needs.\n\nLooking forward to hearing from you!`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite {artistName} to Project
          </DialogTitle>
          <DialogDescription>
            Send a direct invitation to this voice talent to work on one of your projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Select Project</Label>
            <Select value={selectedGigId} onValueChange={setSelectedGigId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project to invite to" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingGigs ? (
                   <div className="flex justify-center p-2"><Loader2 className="animate-spin w-4 h-4" /></div>
                ) : gigs.map((gig) => (
                  <SelectItem key={gig.id} value={gig.id.toString()}>
                    {gig.title} - ${gig.budget}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Details */}
          {selectedGig && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <h4 className="font-medium mb-1">{selectedGig.title}</h4>
              <p className="text-muted-foreground mb-2 line-clamp-2">
                {selectedGig.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  {selectedGig.language}
                </span>
                <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs">
                  {selectedGig.accent} accent
                </span>
                <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs">
                  {selectedGig.tone} tone
                </span>
              </div>
            </div>
          )}

          {/* Invitation Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Invitation Message</Label>
            <Textarea
              id="message"
              rows={5}
              placeholder="Write a personalized invitation message..."
              value={invitationMessage}
              onChange={(e) => setInvitationMessage(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setInvitationMessage(generateDefaultMessage())}
              className="text-xs"
            >
              Use template message
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-gradient"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;