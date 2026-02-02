import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScriptUpload } from '@/components/ScriptUpload';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';

export default function Upload() {
  const navigate = useNavigate();
  const { user, currentOrganization } = useAuth();
  const [uploadComplete, setUploadComplete] = useState(false);

  // Redirect if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  // Redirect to onboarding if no organization
  if (!currentOrganization) {
    navigate('/onboarding');
    return null;
  }

  const handleUploadComplete = (scriptId: string) => {
    setUploadComplete(true);
    // Navigation is now handled by ScriptUpload's explicit navigation functions
    // (handleRunAnalysis, handleViewScript) - no auto-redirect needed
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo size="sm" />
            </div>
            <div className="text-sm text-muted-foreground">
              {currentOrganization.name}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Upload a Script</h1>
            <p className="text-muted-foreground">
              Upload your screenplay for AI-powered analysis across 12+ specialized agents.
              Web series scripts will prompt for episode length classification.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl">
            <ScriptUpload
              onUploadComplete={handleUploadComplete}
              onClose={() => navigate('/dashboard')}
            />
          </div>

          {/* Format info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-card border border-border">
              <h3 className="font-medium mb-2">Best Formats</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Fountain</strong> - Best parsing accuracy</li>
                <li>• <strong>Final Draft</strong> - Industry standard</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <h3 className="font-medium mb-2">Also Supported</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>PDF</strong> - AI-assisted extraction</li>
                <li>• <strong>Plain Text</strong> - Basic parsing</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
