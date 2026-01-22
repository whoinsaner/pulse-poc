import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Building2, Upload, Loader2, Save, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, currentOrganization, userRole, isLoading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Organization form state
  const [orgName, setOrgName] = useState('');
  const [orgLogoUrl, setOrgLogoUrl] = useState<string | null>(null);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  useEffect(() => {
    if (currentOrganization) {
      setOrgName(currentOrganization.name);
      setOrgLogoUrl(currentOrganization.logo_url);
    }
  }, [currentOrganization]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          avatar_url: avatarUrl,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      if (!currentOrganization?.id) {
        throw new Error('No organization selected');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      // Use org-scoped path to satisfy RLS policy
      const filePath = `${currentOrganization.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('scripts')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Use signed URL since bucket is private
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('scripts')
        .createSignedUrl(filePath, 86400); // 24 hour expiry

      if (urlError) throw urlError;

      setAvatarUrl(signedUrlData.signedUrl);
      toast({
        title: 'Avatar uploaded',
        description: 'Click Save to apply your new avatar.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!currentOrganization || userRole !== 'admin') return;

    setIsSavingOrg(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: orgName.trim(),
          logo_url: orgLogoUrl,
        })
        .eq('id', currentOrganization.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: 'Organization updated',
        description: 'Organization settings have been saved.',
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to update organization. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingOrg(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentOrganization) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${currentOrganization.id}-${Date.now()}.${fileExt}`;
      // Use org-scoped path to satisfy RLS policy
      const filePath = `${currentOrganization.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('scripts')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Use signed URL since bucket is private
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('scripts')
        .createSignedUrl(filePath, 86400); // 24 hour expiry

      if (urlError) throw urlError;

      setOrgLogoUrl(signedUrlData.signedUrl);
      toast({
        title: 'Logo uploaded',
        description: 'Click Save to apply the new logo.',
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload logo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.charAt(0).toUpperCase();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your profile and organization</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="organization" className="flex items-center gap-2" disabled={userRole !== 'admin'}>
              <Building2 className="h-4 w-4" />
              Organization
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information and avatar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
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
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                      />
                      {isUploadingAvatar ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      )}
                    </label>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{fullName || 'No name set'}</p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Click the avatar to upload a new image
                    </p>
                  </div>
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organization Tab */}
          <TabsContent value="organization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>
                  Manage your organization's details and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Section */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className={cn(
                      "h-24 w-24 rounded-xl border-2 border-border flex items-center justify-center",
                      "bg-gradient-to-br from-primary/10 to-primary/5"
                    )}>
                      {orgLogoUrl ? (
                        <img
                          src={orgLogoUrl}
                          alt={orgName}
                          className="h-full w-full object-cover rounded-xl"
                        />
                      ) : (
                        <Building2 className="h-10 w-10 text-primary/50" />
                      )}
                    </div>
                    <label className={cn(
                      "absolute inset-0 flex items-center justify-center rounded-xl cursor-pointer",
                      "bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    )}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={isUploadingLogo}
                      />
                      {isUploadingLogo ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      )}
                    </label>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{orgName}</p>
                    <p className="text-sm text-muted-foreground">
                      Slug: {currentOrganization?.slug}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click the logo area to upload a new image
                    </p>
                  </div>
                </div>

                {/* Organization Name */}
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Enter organization name"
                  />
                </div>

                {/* Slug (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={currentOrganization?.slug || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    The slug is auto-generated and cannot be changed
                  </p>
                </div>

                <Button onClick={handleSaveOrganization} disabled={isSavingOrg || userRole !== 'admin'}>
                  {isSavingOrg ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Organization
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}