import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Upload, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OrganizationSettings() {
  const { user, currentOrganization, userRole, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [orgName, setOrgName] = useState('');
  const [orgLogoUrl, setOrgLogoUrl] = useState<string | null>(null);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (currentOrganization) {
      setOrgName(currentOrganization.name);
      setOrgLogoUrl(currentOrganization.logo_url);
    }
  }, [currentOrganization]);

  const handleSaveOrganization = async () => {
    if (!currentOrganization || userRole !== 'admin') return;
    setIsSavingOrg(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name: orgName.trim(), logo_url: orgLogoUrl })
        .eq('id', currentOrganization.id);
      if (error) throw error;
      await refreshProfile();
      toast({ title: 'Organization updated', description: 'Organization settings have been saved.' });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({ title: 'Error', description: 'Failed to update organization.', variant: 'destructive' });
    } finally {
      setIsSavingOrg(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentOrganization) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image smaller than 2MB.', variant: 'destructive' });
      return;
    }
    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${currentOrganization.id}-${Date.now()}.${fileExt}`;
      const filePath = `${currentOrganization.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('scripts').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: signedUrlData, error: urlError } = await supabase.storage.from('scripts').createSignedUrl(filePath, 86400);
      if (urlError) throw urlError;
      setOrgLogoUrl(signedUrlData.signedUrl);
      toast({ title: 'Logo uploaded', description: 'Click Save to apply the new logo.' });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({ title: 'Upload failed', description: 'Failed to upload logo.', variant: 'destructive' });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>Manage your organization's details and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className={cn(
                "h-24 w-24 rounded-xl border-2 border-border flex items-center justify-center",
                "bg-gradient-to-br from-primary/10 to-primary/5"
              )}>
                {orgLogoUrl ? (
                  <img src={orgLogoUrl} alt={orgName} className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <Building2 className="h-10 w-10 text-primary/50" />
                )}
              </div>
              <label className={cn(
                "absolute inset-0 flex items-center justify-center rounded-xl cursor-pointer",
                "bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
              )}>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                {isUploadingLogo ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
              </label>
            </div>
            <div className="space-y-1">
              <p className="font-medium">{orgName}</p>
              <p className="text-sm text-muted-foreground">Slug: {currentOrganization?.slug}</p>
              <p className="text-xs text-muted-foreground">Click the logo area to upload a new image</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Enter organization name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={currentOrganization?.slug || ''} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">The slug is auto-generated and cannot be changed</p>
          </div>
          <Button onClick={handleSaveOrganization} disabled={isSavingOrg || userRole !== 'admin'}>
            {isSavingOrg ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Organization
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
