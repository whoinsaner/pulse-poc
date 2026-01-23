import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { History, RotateCcw, ChevronDown, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AgentVersion {
  id: string;
  agent_config_id: string;
  version_number: number;
  display_name: string;
  description: string | null;
  parameters: string[];
  system_prompt: string;
  created_by: string;
  created_at: string;
  change_summary: string | null;
}

interface AgentVersionHistoryProps {
  agentConfigId: string;
  currentVersion: number;
  onRevert: (version: AgentVersion) => void;
}

export function AgentVersionHistory({ 
  agentConfigId, 
  currentVersion,
  onRevert 
}: AgentVersionHistoryProps) {
  const [versions, setVersions] = useState<AgentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<AgentVersion | null>(null);
  const [compareVersion, setCompareVersion] = useState<AgentVersion | null>(null);
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);

  const fetchVersions = async () => {
    if (!agentConfigId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("agent_prompt_versions")
        .select("*")
        .eq("agent_config_id", agentConfigId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error("Error fetching versions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open, agentConfigId]);

  const handleRevert = () => {
    if (selectedVersion) {
      onRevert(selectedVersion);
      setRevertDialogOpen(false);
      setOpen(false);
      toast.success(`Reverted to version ${selectedVersion.version_number}`);
    }
  };

  const getDiff = (oldText: string, newText: string): { added: number; removed: number } => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    
    let added = 0;
    let removed = 0;
    
    // Simple line-based diff approximation
    const oldSet = new Set(oldLines);
    const newSet = new Set(newLines);
    
    for (const line of newLines) {
      if (!oldSet.has(line)) added++;
    }
    for (const line of oldLines) {
      if (!newSet.has(line)) removed++;
    }
    
    return { added, removed };
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            History
            {versions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {versions.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </SheetTitle>
            <SheetDescription>
              View and restore previous versions of this agent configuration
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Loading versions...
              </div>
            ) : versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mb-4 opacity-50" />
                <p>No version history available</p>
                <p className="text-sm">Save changes to create version snapshots</p>
              </div>
            ) : (
              <div className="space-y-2 pr-4">
                {versions.map((version, index) => {
                  const prevVersion = versions[index + 1];
                  const diff = prevVersion 
                    ? getDiff(prevVersion.system_prompt, version.system_prompt)
                    : null;
                  
                  return (
                    <Collapsible key={version.id}>
                      <div className={cn(
                        "border rounded-lg p-3 transition-colors",
                        version.version_number === currentVersion && "border-primary bg-primary/5"
                      )}>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2">
                              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-90" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    Version {version.version_number}
                                  </span>
                                  {version.version_number === currentVersion && (
                                    <Badge variant="secondary" className="text-xs">
                                      Current
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                            </div>
                            {diff && (
                              <div className="flex gap-2 text-xs">
                                {diff.added > 0 && (
                                  <span className="text-green-600">+{diff.added}</span>
                                )}
                                {diff.removed > 0 && (
                                  <span className="text-red-600">-{diff.removed}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="mt-3 space-y-3">
                          {version.change_summary && (
                            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              {version.change_summary}
                            </p>
                          )}
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCompareVersion(version)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {version.version_number !== currentVersion && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedVersion(version);
                                  setRevertDialogOpen(true);
                                }}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Revert
                              </Button>
                            )}
                          </div>
                          
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                              <strong>Parameters:</strong> {version.parameters.length} defined
                            </p>
                            <p>
                              <strong>Prompt length:</strong> {version.system_prompt.length} chars
                            </p>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* View Version Dialog */}
      <Dialog open={!!compareVersion} onOpenChange={() => setCompareVersion(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Version {compareVersion?.version_number} - {compareVersion?.display_name}
            </DialogTitle>
            <DialogDescription>
              Saved on {compareVersion && format(new Date(compareVersion.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4 pr-4">
              {compareVersion?.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{compareVersion.description}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-1">Parameters ({compareVersion?.parameters.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {compareVersion?.parameters.map((param) => (
                    <Badge key={param} variant="secondary" className="text-xs">
                      {param}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">System Prompt</h4>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono">
                  {compareVersion?.system_prompt}
                </pre>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Revert Confirmation Dialog */}
      <AlertDialog open={revertDialogOpen} onOpenChange={setRevertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert to Version {selectedVersion?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the agent configuration to version {selectedVersion?.version_number}. 
              The current configuration will be saved as a new version before reverting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevert}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Revert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
