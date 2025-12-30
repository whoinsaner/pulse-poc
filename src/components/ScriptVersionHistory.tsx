import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  History,
  Upload,
  FileText,
  Calendar,
  User,
  Download,
  ExternalLink,
  Loader2,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ScriptVersion {
  id: string;
  script_id: string;
  version_number: number;
  file_url: string;
  notes: string | null;
  created_at: string;
  created_by: string;
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

interface ScriptVersionHistoryProps {
  scriptId: string;
  scriptTitle: string;
  onUploadVersion?: () => void;
}

export function ScriptVersionHistory({ scriptId, scriptTitle, onUploadVersion }: ScriptVersionHistoryProps) {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [scriptId]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('script_versions')
        .select(`
          *,
          profiles:created_by (
            full_name,
            email
          )
        `)
        .eq('script_id', scriptId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data as unknown as ScriptVersion[]);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load version history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (version: ScriptVersion) => {
    window.open(version.file_url, '_blank');
  };

  const canUpload = userRole === 'admin' || userRole === 'analyst';

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </CardTitle>
            <CardDescription>
              {versions.length} version{versions.length !== 1 ? 's' : ''} of "{scriptTitle}"
            </CardDescription>
          </div>
          {canUpload && onUploadVersion && (
            <Button size="sm" onClick={onUploadVersion} disabled={uploading}>
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-1" />
              )}
              New Version
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8">
            <GitBranch className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No versions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload the first version to start tracking changes
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div key={version.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-2 top-2 w-4 h-4 rounded-full border-2",
                      index === 0
                        ? "bg-primary border-primary"
                        : "bg-background border-muted-foreground"
                    )} />

                    <div className={cn(
                      "p-4 rounded-lg border transition-colors",
                      index === 0 ? "border-primary/30 bg-primary/5" : "border-border hover:bg-muted/50"
                    )}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={index === 0 ? 'default' : 'secondary'}>
                              v{version.version_number}
                            </Badge>
                            {index === 0 && (
                              <Badge variant="outline" className="text-xs">Current</Badge>
                            )}
                          </div>

                          {version.notes && (
                            <p className="text-sm text-foreground mb-2">{version.notes}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {version.profiles?.full_name || version.profiles?.email || 'Unknown'}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(version)}
                          title="Download this version"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}