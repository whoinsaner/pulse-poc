import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, Organization, UserRole, AppRole } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  currentOrganization: Organization | null;
  userRole: AppRole | null;
  organizations: Organization[];
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  createOrganization: (name: string) => Promise<{ organization: Organization | null; error: Error | null }>;
  switchOrganization: (orgId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile | null;
  };

  const fetchUserOrganizations = async (userId: string) => {
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('organization_id, role')
      .eq('user_id', userId);

    if (rolesError || !roles?.length) {
      return { organizations: [], currentRole: null };
    }

    const orgIds = roles.map(r => r.organization_id);
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .in('id', orgIds);

    if (orgsError) {
      console.error('Error fetching organizations:', orgsError);
      return { organizations: [], currentRole: null };
    }

    return { 
      organizations: orgs as Organization[], 
      roles: roles as { organization_id: string; role: AppRole }[] 
    };
  };

  const loadUserData = async (userId: string) => {
    const [profileData, orgData] = await Promise.all([
      fetchProfile(userId),
      fetchUserOrganizations(userId),
    ]);

    setProfile(profileData);
    setOrganizations(orgData.organizations);

    if (profileData?.current_organization_id && orgData.organizations.length > 0) {
      const currentOrg = orgData.organizations.find(
        o => o.id === profileData.current_organization_id
      );
      if (currentOrg) {
        setCurrentOrganization(currentOrg);
        const roleEntry = orgData.roles?.find(
          r => r.organization_id === currentOrg.id
        );
        setUserRole(roleEntry?.role || null);
      }
    } else if (orgData.organizations.length > 0) {
      // Set first org as current if none selected
      const firstOrg = orgData.organizations[0];
      setCurrentOrganization(firstOrg);
      const roleEntry = orgData.roles?.find(
        r => r.organization_id === firstOrg.id
      );
      setUserRole(roleEntry?.role || null);
      
      // Update profile with current org
      if (profileData) {
        await supabase
          .from('profiles')
          .update({ current_organization_id: firstOrg.id })
          .eq('user_id', userId);
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(() => {
            loadUserData(session.user.id).finally(() => setIsLoading(false));
          }, 0);
        } else {
          setProfile(null);
          setCurrentOrganization(null);
          setUserRole(null);
          setOrganizations([]);
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserData(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const createOrganization = async (name: string) => {
    if (!user) {
      return { organization: null, error: new Error('Not authenticated') };
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name, slug })
      .select()
      .single();

    if (orgError) {
      return { organization: null, error: orgError as Error };
    }

    // Add user as admin of the new org
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        organization_id: org.id,
        role: 'admin',
      });

    if (roleError) {
      return { organization: null, error: roleError as Error };
    }

    // Update profile with current org
    await supabase
      .from('profiles')
      .update({ current_organization_id: org.id })
      .eq('user_id', user.id);

    // Refresh user data
    await loadUserData(user.id);

    return { organization: org as Organization, error: null };
  };

  const switchOrganization = async (orgId: string) => {
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ current_organization_id: orgId })
      .eq('user_id', user.id);

    await loadUserData(user.id);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        currentOrganization,
        userRole,
        organizations,
        isLoading,
        signIn,
        signUp,
        signOut,
        createOrganization,
        switchOrganization,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
