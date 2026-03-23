import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Link2, Trash2, Clock, Shield, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  reportTitle: string;
  runId: string;
}

interface ShareLink {
  id: string;
  token: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  created_by: string;
}

export function ShareDialog({ open, onOpenChange, reportId, reportTitle, runId }: ShareDialogProps) {
  const { user } = useAuth();
  const [shares, setShares] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expiryDays, setExpiryDays] = useState('30');

  useEffect(() => {
    if (open && reportId) {
      fetchShares();
    }
  }, [open, reportId]);

  const fetchShares = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('report_shares')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setShares(data as ShareLink[]);
    }
    setLoading(false);
  };

  const createShare = async () => {
    if (!user) return;
    setCreating(true);

    const days = parseInt(expiryDays);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const { data, error } = await supabase
      .from('report_shares')
      .insert({
        report_id: reportId,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create share link', { description: error.message });
    } else if (data) {
      const shareUrl = buildShareUrl((data as ShareLink).token);
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link created and copied to clipboard');
      fetchShares();
    }
    setCreating(false);
  };

  const revokeShare = async (shareId: string) => {
    const { error } = await supabase
      .from('report_shares')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', shareId);

    if (error) {
      toast.error('Failed to revoke link');
    } else {
      toast.success('Share link revoked');
      fetchShares();
    }
  };

  const copyShareUrl = async (token: string) => {
    const url = buildShareUrl(token);
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const buildShareUrl = (token: string) => {
    return `${window.location.origin}/report/${runId}/overview?share=${token}`;
  };

  const activeShares = shares.filter(s => !s.revoked_at && new Date(s.expires_at) > new Date());
  const expiredOrRevoked = shares.filter(s => s.revoked_at || new Date(s.expires_at) <= new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share Report
          </DialogTitle>
          <DialogDescription>
            Create a secure link to share "{reportTitle}" with authenticated users outside your organization.
          </DialogDescription>
        </DialogHeader>

        {/* Create new share */}
        <div className="space-y-3 pt-2">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Link expires in</Label>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createShare} disabled={creating} size="sm" className="gap-1.5">
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
              Create Link
            </Button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            Recipients must be logged in to view
          </div>
        </div>

        {/* Active shares */}
        {activeShares.length > 0 && (
          <div className="space-y-2 pt-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Active Links ({activeShares.length})
            </Label>
            {activeShares.map(share => (
              <div key={share.id} className="flex items-center gap-2 p-2 rounded-lg border bg-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {format(new Date(share.expires_at), 'MMM d')}
                    </Badge>
                  </div>
                  <Input
                    readOnly
                    value={buildShareUrl(share.token)}
                    className="h-7 text-xs mt-1.5 bg-muted/50 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => copyShareUrl(share.token)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => revokeShare(share.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Expired/revoked */}
        {expiredOrRevoked.length > 0 && (
          <div className="space-y-1 pt-1">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Expired / Revoked ({expiredOrRevoked.length})
            </Label>
            {expiredOrRevoked.slice(0, 3).map(share => (
              <div key={share.id} className="flex items-center gap-2 p-1.5 rounded text-xs text-muted-foreground line-through opacity-60">
                <span className="font-mono truncate">{share.token.substring(0, 12)}...</span>
                <Badge variant="outline" className="text-[9px] px-1 py-0">
                  {share.revoked_at ? 'Revoked' : 'Expired'}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
