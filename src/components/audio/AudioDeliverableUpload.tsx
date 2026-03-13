import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { AudioDeliverable } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Music, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AudioDeliverableUploadProps {
  gigId: number;
  audioType: "raw" | "produced" | "final";
  talentId?: string;
  producerId?: string;
  onUploadSuccess?: (deliverable: AudioDeliverable) => void;
}

export default function AudioDeliverableUpload({
  gigId,
  audioType,
  talentId,
  producerId,
  onUploadSuccess,
}: AudioDeliverableUploadProps) {
  const { user } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAudioTypeLabel = (type: string) => {
    const labels = {
      raw: "Raw Recording",
      produced: "Produced Audio",
      final: "Final Master",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getAudioTypeColor = (type: string) => {
    const colors = {
      raw: "bg-blue-100 text-blue-700",
      produced: "bg-purple-100 text-purple-700",
      final: "bg-green-100 text-green-700",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const handleFileSelect = async (file: File) => {
    if (!user) {
      toast.error("Please log in to upload");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      toast.error("Please select an audio file");
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setFileName(file.name);
    await uploadAudio(file);
  };

  const uploadAudio = async (file: File) => {
    setIsUploading(true);
    try {
      // Create unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${gigId}_${audioType}_${Date.now()}.${fileExt}`;
      const filePath = `${gigId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from("audio-deliverables")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("audio-deliverables")
        .getPublicUrl(filePath);

      // Create database record
      const { data: deliverable, error: dbError } = await supabase
        .from("audio_deliverables")
        .insert({
          gig_id: gigId,
          talent_id: audioType === "raw" ? user.id : talentId,
          producer_id: audioType !== "raw" ? user.id : producerId,
          audio_type: audioType,
          file_url: publicData?.publicUrl,
          version_number: 1,
          status: "pending",
          feedback: notes,
          created_by: user.id,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success("Audio uploaded successfully!");
      setFileName("");
      setNotes("");

      if (onUploadSuccess) {
        onUploadSuccess(deliverable);
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Failed to upload audio. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              {getAudioTypeLabel(audioType)}
            </CardTitle>
            <CardDescription>Upload your production file</CardDescription>
          </div>
          <Badge className={getAudioTypeColor(audioType)}>
            {getAudioTypeLabel(audioType)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-8 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
            isUploading
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:border-primary hover:bg-muted/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium">Uploading...</p>
                {uploadProgress > 0 && (
                  <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </>
            ) : fileName ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <p className="text-sm font-medium">{fileName}</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload audio</p>
                  <p className="text-xs text-muted-foreground">
                    MP3, WAV, FLAC or OGG (Max 50MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (Optional)</label>
          <Textarea
            placeholder="Add any notes about this upload... e.g., production details, mix notes, or requests for feedback"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isUploading}
            className="min-h-[80px]"
          />
        </div>

        {/* Info */}
        <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Audio Guidelines</p>
            <ul className="text-xs mt-1 space-y-1 opacity-90">
              <li>• Ensure audio is at proper levels (-3dB to -6dB peak)</li>
              <li>• No clipping or distortion</li>
              <li>• Check mono compatibility if needed</li>
            </ul>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !fileName}
          className="w-full"
          size="lg"
        >
          {isUploading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Submit Audio
        </Button>
      </CardContent>
    </Card>
  );
}
