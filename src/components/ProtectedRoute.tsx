import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOrg?: boolean;
}

export function ProtectedRoute({ children, requireOrg = true }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentOrganization, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Preserve the current path so we can redirect back after login
        const redirectParam = location.pathname !== '/' ? `?redirect=${encodeURIComponent(location.pathname + location.search)}` : '';
        navigate(`/auth${redirectParam}`);
      } else if (requireOrg && !currentOrganization) {
        navigate('/onboarding');
      }
    }
  }, [user, currentOrganization, isLoading, navigate, requireOrg, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user || (requireOrg && !currentOrganization)) {
    return null;
  }

  return <>{children}</>;
}
