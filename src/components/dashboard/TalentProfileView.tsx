import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/useAuthStore";
import { Upload, Play, Trash2, Plus, Loader2, Save, Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Demo {
  id: number;
  title: string;
  duration: string;
  type: string;
  file_path: string;
}

const TalentProfileView = () => {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [demos, setDemos] = useState<Demo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [name, setName] = useState(user?.name || "");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      const fetchDemosAsync = async () => {
        try {
          const { data, error } = await supabase
            .from('demos')
            .select('*')
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          if (isMounted) {
            setDemos(data as unknown as Demo[]);
          }
        } catch (error) {
          if (isMounted) {
            console.error("Failed to fetch demos", error);
          }
        }
      };

      fetchDemosAsync();
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      if (user.bio) setBio(user.bio);
      if (user.name) setName(user.name);
      if (user.skills) {
        try {
          let parsed;
          if (typeof user.skills === 'string') {
            if (user.skills.trim().startsWith('[') || user.skills.trim().startsWith('{')) {
              parsed = JSON.parse(user.skills);
            } else {
              // Handle comma-separated string
              parsed = user.skills.split(',').map(s => s.trim()).filter(Boolean);
            }
          } else {
            parsed = user.skills;
          }
          if (Array.isArray(parsed)) setSkills(parsed);
        } catch (e) {
          console.error("Failed to parse skills", e);
          // Fallback: treat as single skill or comma-separated if it's a string
          if (typeof user.skills === 'string') {
            setSkills(user.skills.split(',').map(s => s.trim()).filter(Boolean));
          }
        }
      }
    }
  }, [user]);

  const copyProfileLink = () => {
    const link = `${window.location.origin}/artists/${user?.id}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    toast({ title: "Link Copied", description: "Your unique profile link has been copied to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const fetchDemos = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('demos')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      setDemos(data as unknown as Demo[]);
    } catch (error) {
      console.error("Failed to fetch demos", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('demos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('demos')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('demos')
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ""),
          file_path: publicUrlData.publicUrl,
          type: 'Demo',
          duration: '0:00'
        });

      if (dbError) throw dbError;

      toast({ title: "Success", description: "Demo uploaded successfully" });
      fetchDemos();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to upload demo", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image: publicUrlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUser({ ...user, profile_image: publicUrlData.publicUrl });
      toast({ title: "Success", description: "Profile image updated" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to upload profile image", variant: "destructive" });
    }
  };

  const handleDeleteDemo = async (id: number) => {
    try {
      const { error } = await supabase
        .from('demos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Success", description: "Demo deleted" });
      setDemos(demos.filter(d => d.id !== id));
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete demo", variant: "destructive" });
    }
  };

  const handleSaveProfile = async () => {
     setIsSaving(true);
     try {
       if (!user) return;
       
       const updates = {
         name,
         bio,
         skills: JSON.stringify(skills),
         updated_at: new Date().toISOString()
       };

       const { error } = await supabase
         .from('users')
         .update(updates)
         .eq('id', user.id);

       if (error) throw error;
       
       setUser({ ...user, ...updates });
       toast({ title: "Profile Saved", description: "Your changes have been saved." });
     } catch (error) {
       console.error(error);
       toast({ title: "Error", description: "Failed to save profile", variant: "destructive" });
     } finally {
       setIsSaving(false);
     }
  };

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-heading">My Profile</h2>
          <p className="text-muted-foreground">Manage your public appearance and portfolio.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={copyProfileLink}>
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {isCopied ? "Copied" : "Copy Profile Link"}
          </Button>
          <Button className="btn-gradient" asChild>
            <Link to={`/artists/${user?.id}`}>View Public Profile</Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Basic Info */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                <AvatarImage src={user?.profile_image} className="object-cover" />
                <AvatarFallback className="text-4xl">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <input 
                type="file" 
                ref={avatarInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarUpload}
              />
              <Button 
                size="icon" 
                variant="secondary" 
                className="absolute bottom-0 right-0 rounded-full shadow-md"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            <h3 className="text-xl font-bold">{user?.name}</h3>
            <p className="text-muted-foreground">Professional Voice Artist</p>
            
            <div className="mt-6 w-full space-y-4">
               <div className="text-left">
                 <Label>Display Name</Label>
                 <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
               </div>
               <Button onClick={handleSaveProfile} className="w-full gap-2" disabled={isSaving}>
                 {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                 Save Details
               </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Demos & Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bio & Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="min-h-[150px]" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Tell clients about your experience..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Voice Demos</CardTitle>
                <CardDescription>Upload your best work (MP3, WAV).</CardDescription>
              </div>
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="audio/*"
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2" 
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Upload New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
               {demos.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No demos uploaded yet.</p>}
               {demos.map(demo => (
                 <div key={demo.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <Button size="icon" variant="ghost" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 shrink-0">
                         <Play className="w-4 h-4 ml-0.5" />
                       </Button>
                       <div className="min-w-0">
                         <p className="font-medium truncate">{demo.title}</p>
                         <div className="flex gap-2 text-xs text-muted-foreground">
                           <span>{demo.duration || "0:00"}</span>
                           <span>•</span>
                           <Badge variant="secondary" className="text-[10px] h-4">{demo.type || "Demo"}</Badge>
                         </div>
                       </div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleDeleteDemo(demo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                 </div>
               ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Accents</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex flex-wrap gap-2 mb-4">
                 {skills.map(skill => (
                   <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm gap-2">
                     {skill}
                     <Trash2 
                       className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100" 
                       onClick={() => removeSkill(skill)}
                     />
                   </Badge>
                 ))}
               </div>
               <div className="flex gap-2">
                 <Input 
                   placeholder="Add a skill..." 
                   value={newSkill} 
                   onChange={(e) => setNewSkill(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                 />
                 <Button variant="outline" onClick={addSkill}>Add</Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TalentProfileView;
