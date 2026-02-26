import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  User,
  Building2,
  Users,
  Cpu,
  Bot,
  Layers,
  Sparkles,
  FileJson,
  Scale,
  ShieldBan,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly: boolean;
  children?: { label: string; path: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Profile', path: '/settings/profile', icon: User, adminOnly: false },
  { label: 'Organization', path: '/settings/organization', icon: Building2, adminOnly: true },
  { label: 'Team', path: '/settings/team', icon: Users, adminOnly: true },
  { label: 'AI Models', path: '/settings/models', icon: Cpu, adminOnly: true },
  { label: 'Agent Prompts', path: '/settings/agents', icon: Bot, adminOnly: true },
  {
    label: 'Parameters',
    path: '/settings/parameters',
    icon: Layers,
    adminOnly: false,
    children: [
      { label: 'Schema & Flow', path: '/settings/parameters/schema' },
      { label: 'Lens Weights', path: '/settings/parameters/weights' },
    ],
  },
  {
    label: 'Features',
    path: '/settings/features',
    icon: Sparkles,
    adminOnly: false,
    children: [
      { label: 'Parser Settings', path: '/settings/features/parser' },
      { label: 'Stopwords', path: '/settings/features/stopwords' },
    ],
  },
];

export default function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || userRole === 'admin'
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your workspace configuration</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-border">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <nav className="p-4 space-y-0.5">
              {visibleItems.map((item) => {
                const isParentActive = item.children
                  ? location.pathname.startsWith(item.path)
                  : false;

                return (
                  <div key={item.path}>
                    <NavLink
                      to={item.path}
                      end={!!item.children || item.path === '/settings/profile'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive || isParentActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </NavLink>

                    {/* Sub-items */}
                    {item.children && isParentActive && (
                      <div className="ml-7 mt-0.5 space-y-0.5 border-l border-border pl-3">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) =>
                              cn(
                                'block px-2 py-1.5 rounded-md text-xs font-medium transition-colors',
                                isActive
                                  ? 'text-primary bg-primary/5'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              )
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
