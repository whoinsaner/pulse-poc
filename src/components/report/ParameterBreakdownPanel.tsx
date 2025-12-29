import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, ChevronRight, Layers, CheckCircle, Clock, XCircle,
  Lightbulb, GitBranch, Users, Swords, Palette, MessageSquare,
  Globe, Heart, TrendingUp, Cog, FileInput, Tag, Scale, Blend,
  RefreshCcw, Search, Briefcase, Eye, MessageCircle, Timer, Map, Mic, Gamepad2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentProgress } from '@/types/database';
import { 
  getAnalysisAgentsForScriptType,
  type AgentDefinition 
} from '@/lib/scriptFramework';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb, GitBranch, Users, Swords, Palette, MessageSquare,
  Globe, Heart, TrendingUp, Cog, FileInput, Tag, Scale, Blend,
  RefreshCw: RefreshCcw, Search, Briefcase, Eye, MessageCircle,
  Timer, Map, Mic, Gamepad2
};

interface AgentParameterRowProps {
  agent: AgentDefinition;
  progress: AgentProgress | undefined;
  isExpanded: boolean;
  onToggle: () => void;
}

function AgentParameterRow({ agent, progress, isExpanded, onToggle }: AgentParameterRowProps) {
  const Icon = ICON_MAP[agent.icon] || Lightbulb;
  const status = progress?.status;
  
  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
          <CheckCircle className="h-3 w-3 mr-1" /> Complete
        </Badge>;
      case 'running':
        return <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 animate-pulse">
          <Clock className="h-3 w-3 mr-1" /> Running
        </Badge>;
      case 'failed':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          <XCircle className="h-3 w-3 mr-1" /> Failed
        </Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>;
    }
  };

  const formatParamName = (param: string) => {
    return param
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start p-3 h-auto hover:bg-muted/50",
            status === 'completed' && "bg-emerald-500/5",
            status === 'running' && "bg-blue-500/5",
            status === 'failed' && "bg-destructive/5"
          )}
        >
          <div className="flex items-center gap-3 w-full">
            <div className={cn(
              "p-1.5 rounded-md",
              status === 'completed' && "bg-emerald-500/20",
              status === 'running' && "bg-blue-500/20",
              status === 'failed' && "bg-destructive/20",
              !status && "bg-muted"
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-sm">{agent.name}</div>
              <div className="text-xs text-muted-foreground">
                {agent.parameters.length} parameters
              </div>
            </div>
            {getStatusBadge()}
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="px-4 pb-3 pt-1">
          <p className="text-xs text-muted-foreground mb-3">{agent.description}</p>
          
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Parameters Evaluated
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {agent.parameters.map((param) => (
                <div
                  key={param}
                  className={cn(
                    "px-2 py-1.5 rounded-md text-xs border",
                    status === 'completed' 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-muted/50 border-border text-muted-foreground"
                  )}
                >
                  {formatParamName(param)}
                </div>
              ))}
            </div>
          </div>
          
          {agent.reportSections.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Report Sections
              </div>
              <div className="flex flex-wrap gap-1">
                {agent.reportSections.map((section) => (
                  <Badge key={section} variant="outline" className="text-xs">
                    {section}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface ParameterBreakdownPanelProps {
  scriptType: string;
  agentProgress: Record<string, AgentProgress>;
}

export function ParameterBreakdownPanel({ 
  scriptType, 
  agentProgress 
}: ParameterBreakdownPanelProps) {
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  
  const applicableAgents = useMemo(() => {
    return getAnalysisAgentsForScriptType(scriptType);
  }, [scriptType]);
  
  const stats = useMemo(() => {
    const totalParams = applicableAgents.reduce((sum, a) => sum + a.parameters.length, 0);
    const completedAgents = applicableAgents.filter(a => agentProgress[a.id]?.status === 'completed');
    const completedParams = completedAgents.reduce((sum, a) => sum + a.parameters.length, 0);
    
    return { totalParams, completedParams };
  }, [applicableAgents, agentProgress]);
  
  const toggleAgent = (agentId: string) => {
    setExpandedAgents(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };
  
  const expandAll = () => {
    setExpandedAgents(new Set(applicableAgents.map(a => a.id)));
  };
  
  const collapseAll = () => {
    setExpandedAgents(new Set());
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-primary" />
            Parameter Breakdown
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {stats.completedParams}/{stats.totalParams} params scored
            </Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={expandAll} className="text-xs h-7 px-2">
                Expand All
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAll} className="text-xs h-7 px-2">
                Collapse
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y">
          {applicableAgents.map((agent) => (
            <AgentParameterRow
              key={agent.id}
              agent={agent}
              progress={agentProgress[agent.id]}
              isExpanded={expandedAgents.has(agent.id)}
              onToggle={() => toggleAgent(agent.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ParameterBreakdownPanel;
