import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, FileText, BarChart3, Users, LogOut, Plus, Layers, FlaskConical } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, currentOrganization, userRole, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Logo size="lg" className="justify-center mb-4" />
            <CardTitle>No Organization Found</CardTitle>
            <CardDescription>
              You need to create or join an organization to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/onboarding')} className="w-full">
              Create Organization
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {profile?.full_name || profile?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground">
            {currentOrganization.name} • {userRole?.charAt(0).toUpperCase()}{userRole?.slice(1)}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="card-hover cursor-pointer group" onClick={() => navigate('/upload')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Upload Script</h3>
                <p className="text-sm text-muted-foreground">Analyze a new screenplay</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer group" onClick={() => navigate('/scripts')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-info/10 group-hover:bg-info/20 transition-colors">
                <FileText className="h-6 w-6 text-info" />
              </div>
              <div>
                <h3 className="font-semibold">Script Library</h3>
                <p className="text-sm text-muted-foreground">View all scripts</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer group" onClick={() => navigate('/reports')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">Reports</h3>
                <p className="text-sm text-muted-foreground">View analysis reports</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer group" onClick={() => navigate('/parameters')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <Layers className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">Parameters</h3>
                <p className="text-sm text-muted-foreground">Agents & lenses</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer group" onClick={() => navigate('/test-pipeline')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <FlaskConical className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold">Test Pipeline</h3>
                <p className="text-sm text-muted-foreground">Run full analysis test</p>
              </div>
            </CardContent>
          </Card>

          {userRole === 'admin' && (
            <Card className="card-hover cursor-pointer group" onClick={() => navigate('/team')}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-warning/10 group-hover:bg-warning/20 transition-colors">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold">Team</h3>
                  <p className="text-sm text-muted-foreground">Manage members</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sample Reports */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Explore Sample Reports</CardTitle>
            <CardDescription>See how Pulse analyzes different script types</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => navigate('/sample-report')}>
              <FileText className="h-4 w-4 mr-2" />
              View Film Sample
            </Button>
            <Button variant="outline" onClick={() => navigate('/sample-comic-report')}>
              <FileText className="h-4 w-4 mr-2" />
              View Comic Sample
            </Button>
          </CardContent>
        </Card>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload your first script</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by uploading a screenplay. Pulse supports PDF, Final Draft, 
              Fountain, and plain text formats.
            </p>
            <Button onClick={() => navigate('/upload')}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Script
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
