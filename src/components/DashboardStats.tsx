import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, BarChart3, Clock, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  className?: string;
}

interface Stats {
  totalScripts: number;
  totalReports: number;
  inProgressAnalyses: number;
  averageScore: number | null;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'script_upload' | 'analysis_complete' | 'analysis_started';
  title: string;
  timestamp: string;
}

export function DashboardStats({ className }: DashboardStatsProps) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.current_organization_id) {
      fetchStats();
    }
  }, [profile?.current_organization_id]);

  const fetchStats = async () => {
    if (!profile?.current_organization_id) return;

    setLoading(true);
    try {
      // Fetch scripts count
      const { count: scriptsCount } = await supabase
        .from('scripts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.current_organization_id);

      // Fetch reports with scores
      const { data: reports, count: reportsCount } = await supabase
        .from('reports')
        .select('overall_score', { count: 'exact' })
        .eq('organization_id', profile.current_organization_id);

      // Fetch in-progress analyses
      const { count: inProgressCount } = await supabase
        .from('analysis_runs')
        .select('*, scripts!inner(organization_id)', { count: 'exact', head: true })
        .eq('scripts.organization_id', profile.current_organization_id)
        .in('status', ['pending', 'processing']);

      // Calculate average score
      let averageScore: number | null = null;
      if (reports && reports.length > 0) {
        const validScores = reports.filter(r => r.overall_score !== null).map(r => r.overall_score as number);
        if (validScores.length > 0) {
          averageScore = validScores.reduce((a, b) => a + b, 0) / validScores.length;
        }
      }

      // Fetch recent activity
      const { data: recentScripts } = await supabase
        .from('scripts')
        .select('id, title, created_at')
        .eq('organization_id', profile.current_organization_id)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: recentReports } = await supabase
        .from('reports')
        .select('id, title, created_at')
        .eq('organization_id', profile.current_organization_id)
        .order('created_at', { ascending: false })
        .limit(3);

      const activity: ActivityItem[] = [
        ...(recentScripts || []).map(s => ({
          id: s.id,
          type: 'script_upload' as const,
          title: s.title,
          timestamp: s.created_at,
        })),
        ...(recentReports || []).map(r => ({
          id: r.id,
          type: 'analysis_complete' as const,
          title: r.title,
          timestamp: r.created_at,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

      setStats({
        totalScripts: scriptsCount || 0,
        totalReports: reportsCount || 0,
        inProgressAnalyses: inProgressCount || 0,
        averageScore,
        recentActivity: activity,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-10 w-10 rounded-lg mb-3" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats || (stats.totalScripts === 0 && stats.totalReports === 0)) {
    return null; // Don't show stats if empty
  }

  const statCards = [
    {
      icon: FileText,
      label: 'Total Scripts',
      value: stats.totalScripts,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      icon: BarChart3,
      label: 'Completed Reports',
      value: stats.totalReports,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Clock,
      label: 'In Progress',
      value: stats.inProgressAnalyses,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: TrendingUp,
      label: 'Average Score',
      value: stats.averageScore !== null ? stats.averageScore.toFixed(1) : '—',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="card-hover">
            <CardContent className="p-6">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', stat.bgColor)}>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    activity.type === 'script_upload' ? 'bg-info' :
                    activity.type === 'analysis_complete' ? 'bg-success' : 'bg-warning'
                  )} />
                  <span className="text-muted-foreground">
                    {activity.type === 'script_upload' ? 'Uploaded' :
                     activity.type === 'analysis_complete' ? 'Completed' : 'Started'}
                  </span>
                  <span className="font-medium truncate flex-1">{activity.title}</span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}