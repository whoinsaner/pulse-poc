import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Brain } from 'lucide-react';

export default function FeaturesSettings() {
  const { toast } = useToast();
  const [autoClassifyEnabled, setAutoClassifyEnabled] = useState(() => {
    return localStorage.getItem('pulse_auto_classify') !== 'false';
  });

  const [reasoningEnabled, setReasoningEnabled] = useState(() => {
    return localStorage.getItem('pulse_reasoning_enabled') === 'true';
  });

  const [reasoningEffort, setReasoningEffort] = useState<'low' | 'medium' | 'high'>(() => {
    return (localStorage.getItem('pulse_reasoning_effort') as 'low' | 'medium' | 'high') || 'medium';
  });

  const handleToggleAutoClassify = (checked: boolean) => {
    setAutoClassifyEnabled(checked);
    localStorage.setItem('pulse_auto_classify', checked ? 'true' : 'false');
    toast({
      title: checked ? 'Auto-classification enabled' : 'Auto-classification disabled',
      description: checked
        ? 'Script type will be auto-detected on upload.'
        : 'You will manually select the script type.',
    });
  };

  const handleToggleReasoning = (checked: boolean) => {
    setReasoningEnabled(checked);
    localStorage.setItem('pulse_reasoning_enabled', checked ? 'true' : 'false');
    toast({
      title: checked ? 'Reasoning enabled' : 'Reasoning disabled',
      description: checked
        ? 'AI will use chain-of-thought reasoning during analysis.'
        : 'Analysis will run without extended reasoning.',
    });
  };

  const handleReasoningEffortChange = (value: string) => {
    const effort = value as 'low' | 'medium' | 'high';
    setReasoningEffort(effort);
    localStorage.setItem('pulse_reasoning_effort', effort);
    toast({
      title: 'Reasoning effort updated',
      description: `Default reasoning effort set to ${effort}.`,
    });
  };

  return (
    <div className="p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Feature Settings</CardTitle>
          <CardDescription>Enable or disable experimental features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-Detect Script Type */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Auto-Detect Script Type</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatically classify the script type (feature, comic, web series, etc.)
                  when a file is dropped. Uses AI to analyze the script content.
                </p>
              </div>
            </div>
            <Switch checked={autoClassifyEnabled} onCheckedChange={handleToggleAutoClassify} />
          </div>

          {/* Reasoning */}
          <div className="p-4 rounded-lg border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Chain-of-Thought Reasoning</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enable extended reasoning for complex analysis agents (Structure, Character,
                    Conflict, Theme, Dialogue, Emotional Arc). Improves depth but increases latency.
                  </p>
                </div>
              </div>
              <Switch checked={reasoningEnabled} onCheckedChange={handleToggleReasoning} />
            </div>

            {reasoningEnabled && (
              <div className="ml-8 pl-3 border-l-2 border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Default Effort Level</p>
                <RadioGroup value={reasoningEffort} onValueChange={handleReasoningEffortChange} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="effort-low" />
                    <Label htmlFor="effort-low" className="text-sm cursor-pointer">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="effort-medium" />
                    <Label htmlFor="effort-medium" className="text-sm cursor-pointer">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="effort-high" />
                    <Label htmlFor="effort-high" className="text-sm cursor-pointer">High</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-2">
                  {reasoningEffort === 'low' && 'Minimal reasoning overhead. Fastest but least thorough.'}
                  {reasoningEffort === 'medium' && 'Balanced reasoning depth. Good trade-off between speed and quality.'}
                  {reasoningEffort === 'high' && 'Maximum reasoning depth. Slowest but most thorough analysis.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
