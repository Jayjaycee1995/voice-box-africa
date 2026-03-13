import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { User, ProducerPricingMatrix, ServiceType } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, X, Zap, Music, Mic, Save, DollarSign } from "lucide-react";
import { toast } from "sonner";

const PRODUCER_SKILLS = [
  "vocal_production",
  "mixing",
  "mastering",
  "voice_tuning",
  "sound_design",
  "editing",
  "compression",
  "eq",
  "reverb",
  "noise_reduction",
];

export default function ProducerProfileSetup() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    bio: "",
    producer_skills: [] as string[],
    production_rate_per_hour: 0,
    production_equipment: "",
    turnaround_time_days: 3,
  });

  const [pricingMatrix, setPricingMatrix] = useState<ProducerPricingMatrix>({
    studio_only: { rate_per_hour: 0, base_rate: 0, currency: "USD" },
    raw_recording: { rate_per_hour: 0, base_rate: 0, currency: "USD" },
    produced_and_mixed: { rate_per_hour: 0, base_rate: 0, currency: "USD" },
    producer_only: { rate_per_hour: 0, base_rate: 0, currency: "USD" },
  });

  const serviceTypes: ServiceType[] = ["studio_only", "raw_recording", "produced_and_mixed", "producer_only"];
  const serviceLabels: Record<ServiceType, string> = {
    studio_only: "Studio Only",
    raw_recording: "Raw Recording",
    produced_and_mixed: "Produced & Mixed",
    producer_only: "Producer Only",
  };

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);

        setFormData({
          bio: data.bio || "",
          producer_skills: data.producer_skills || [],
          production_rate_per_hour: data.production_rate_per_hour || 0,
          production_equipment: data.production_equipment || "",
          turnaround_time_days: data.turnaround_time_days || 3,
        });

        // Load pricing matrix
        if (data.pricing_matrix) {
          setPricingMatrix(data.pricing_matrix);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleAddSkill = (skill: string) => {
    if (!formData.producer_skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        producer_skills: [...prev.producer_skills, skill],
      }));
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      producer_skills: prev.producer_skills.filter((s) => s !== skill),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          bio: formData.bio,
          producer_skills: formData.producer_skills,
          production_rate_per_hour: formData.production_rate_per_hour,
          production_equipment: formData.production_equipment,
          turnaround_time_days: formData.turnaround_time_days,
          pricing_matrix: pricingMatrix,
          is_producer: true,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const availableSkills = PRODUCER_SKILLS.filter(
    (s) => !formData.producer_skills.includes(s)
  );

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile?.profile_image} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {profile?.name?.charAt(0) || "P"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{profile?.name}</h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <Badge className="mt-2">Producer</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>About You</CardTitle>
          <CardDescription>
            Tell clients about your production expertise and style
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Describe your experience, specialties, and production philosophy..."
            value={formData.bio}
            onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            {formData.bio.length}/500 characters
          </p>
        </CardContent>
      </Card>

      {/* Production Skills */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Production Skills
          </CardTitle>
          <CardDescription>
            Select the production services you specialize in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Skills */}
          <div>
            <p className="text-sm font-medium mb-3">Your Skills</p>
            {formData.producer_skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No skills selected yet. Add some below.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.producer_skills.map((skill) => (
                  <Badge
                    key={skill}
                    className="gap-1 pl-3 cursor-pointer hover:bg-primary/80"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    {skill.replace(/_/g, " ")}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Available Skills */}
          <div>
            <p className="text-sm font-medium mb-3">Add More Skills</p>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleAddSkill(skill)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {skill.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Availability */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Pricing & Availability
          </CardTitle>
          <CardDescription>
            Set your rates and typical turnaround time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Production Rate ($/hour)</label>
              <Input
                type="number"
                min="0"
                step="5"
                value={formData.production_rate_per_hour}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    production_rate_per_hour: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground">
                This is used to calculate project bids
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Turnaround Time (days)</label>
              <Input
                type="number"
                min="1"
                max="30"
                value={formData.turnaround_time_days}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    turnaround_time_days: parseInt(e.target.value) || 1,
                  }))
                }
                placeholder="3"
              />
              <p className="text-xs text-muted-foreground">
                Typical days to complete a project
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Production Equipment
          </CardTitle>
          <CardDescription>
            List your mixer, software, plugins, and studio setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="e.g., Neumann U87, SSL 4000E console, Pro Tools, Waves plugins, acoustically treated studio..."
            value={formData.production_equipment}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                production_equipment: e.target.value,
              }))
            }
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            Helps clients understand your production quality
          </p>
        </CardContent>
      </Card>

      {/* Service Pricing */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Service Pricing
          </CardTitle>
          <CardDescription>
            Set custom pricing for each service type clients can request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {serviceTypes.map((serviceType) => (
              <div key={serviceType} className="space-y-4 p-4 bg-muted/30 rounded-lg border border-muted">
                <h4 className="font-medium text-sm">{serviceLabels[serviceType]}</h4>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rate ($/hour)</label>
                  <Input
                    type="number"
                    min="0"
                    step="5"
                    value={pricingMatrix[serviceType]?.rate_per_hour || 0}
                    onChange={(e) =>
                      setPricingMatrix((prev) => ({
                        ...prev,
                        [serviceType]: {
                          ...prev[serviceType],
                          rate_per_hour: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    placeholder="e.g., 75"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Base Rate ($)</label>
                  <Input
                    type="number"
                    min="0"
                    step="10"
                    value={pricingMatrix[serviceType]?.base_rate || 0}
                    onChange={(e) =>
                      setPricingMatrix((prev) => ({
                        ...prev,
                        [serviceType]: {
                          ...prev[serviceType],
                          base_rate: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    placeholder="e.g., 500 (optional)"
                  />
                  <p className="text-xs text-muted-foreground">
                    One-time project fee (optional)
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> Hourly rates are multiplied by turnaround time. Base rates are added on top for flat fees.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full btn-gradient"
        size="lg"
      >
        {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        <Save className="w-4 h-4 mr-2" />
        Save Profile
      </Button>
    </div>
  );
}
