import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

export default function FeaturesSettings() {
  const { toast } = useToast();
  const [autoClassifyEnabled, setAutoClassifyEnabled] = useState(() => {
    return localStorage.getItem('pulse_auto_classify') !== 'false';
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

  return (
    <div className="p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Feature Settings</CardTitle>
          <CardDescription>Enable or disable experimental features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>
    </div>
  );
}
