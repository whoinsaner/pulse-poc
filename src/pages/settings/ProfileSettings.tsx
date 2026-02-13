import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfileSettings() {
  const { user, profile, currentOrganization, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() || null, avatar_url: avatarUrl })
        .eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast({ title: 'Profile updated', description: 'Your profile has been saved successfully.' });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image smaller than 2MB.', variant: 'destructive' });
      return;
    }
    setIsUploadingAvatar(true);
    try {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${currentOrganization.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('scripts').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: signedUrlData, error: urlError } = await supabase.storage.from('scripts').createSignedUrl(filePath, 86400);
      if (urlError) throw urlError;
      setAvatarUrl(signedUrlData.signedUrl);
      toast({ title: 'Avatar uploaded', description: 'Click Save to apply your new avatar.' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({ title: 'Upload failed', description: 'Failed to upload avatar.', variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your personal information and avatar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {getInitials(fullName, profile?.email || '')}
                </AvatarFallback>
              </Avatar>
              <label className={cn(
                "absolute inset-0 flex items-center justify-center rounded-full cursor-pointer",
                "bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
              )}>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                {isUploadingAvatar ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6 text-muted-foreground" />}
              </label>
            </div>
            <div className="space-y-1">
              <p className="font-medium">{fullName || 'No name set'}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <p className="text-xs text-muted-foreground">Click the avatar to upload a new image</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email || ''} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
            {isSavingProfile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
