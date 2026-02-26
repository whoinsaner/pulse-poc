import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, RotateCcw } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface ParserSetting {
  id: string;
  key: string;
  value: string;
  label: string;
  description: string | null;
  value_type: string;
}

export default function ParserSettings() {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = userRole === 'admin';
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['parser-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parser_settings')
        .select('*')
        .order('key');
      if (error) throw error;
      return data as ParserSetting[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) => {
      const { error } = await supabase
        .from('parser_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parser-settings'] });
      toast.success('Setting saved');
    },
    onError: () => toast.error('Failed to save setting'),
  });

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const getValue = (setting: ParserSetting) => {
    return editedValues[setting.key] ?? setting.value;
  };

  const isDirty = (setting: ParserSetting) => {
    return setting.key in editedValues && editedValues[setting.key] !== setting.value;
  };

  const handleSave = (setting: ParserSetting) => {
    const val = getValue(setting);
    if (setting.value_type === 'number') {
      const num = Number(val);
      if (isNaN(num) || num < 0) {
        toast.error('Please enter a valid positive number');
        return;
      }
    }
    updateMutation.mutate({ id: setting.id, value: val });
    setEditedValues((prev) => {
      const next = { ...prev };
      delete next[setting.key];
      return next;
    });
  };

  const handleReset = (setting: ParserSetting) => {
    setEditedValues((prev) => {
      const next = { ...prev };
      delete next[setting.key];
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">Loading settings...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Character Extraction Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure dialogue thresholds and filtering rules for the script parser. Changes apply to future parses.
        </p>
      </div>

      <div className="space-y-4">
        {settings.map((setting) => (
          <Card key={setting.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{setting.label}</CardTitle>
              {setting.description && (
                <CardDescription className="text-xs">{setting.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label htmlFor={setting.key} className="sr-only">{setting.label}</Label>
                  <Input
                    id={setting.key}
                    type={setting.value_type === 'number' ? 'number' : 'text'}
                    min={setting.value_type === 'number' ? 0 : undefined}
                    value={getValue(setting)}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    disabled={!isAdmin}
                    className="max-w-[120px] font-mono"
                  />
                </div>
                {isAdmin && isDirty(setting) && (
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => handleSave(setting)}
                      disabled={updateMutation.isPending}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReset(setting)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isAdmin && (
        <p className="text-xs text-muted-foreground italic">
          Only administrators can modify parser settings.
        </p>
      )}
    </div>
  );
}
