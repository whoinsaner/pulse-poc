import { vi } from 'vitest';
import type { User, Session } from '@supabase/supabase-js';

// Mock user data
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: { full_name: 'Test User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: mockUser,
};

// Mock organization data
export const mockOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
  slug: 'test-org',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  logo_url: null,
};

// Mock profile data
export const mockProfile = {
  id: 'test-profile-id',
  user_id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  current_organization_id: 'test-org-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Create mock Supabase client
export const createMockSupabaseClient = () => {
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(() => Promise.resolve({ data: mockProfile, error: null })),
        single: vi.fn(() => Promise.resolve({ data: mockProfile, error: null })),
      })),
      in: vi.fn(() => Promise.resolve({ data: [mockOrganization], error: null })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockOrganization, error: null })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  }));

  const mockAuth = {
    getSession: vi.fn(() => Promise.resolve({ data: { session: mockSession }, error: null })),
    signInWithPassword: vi.fn(() => Promise.resolve({ data: { session: mockSession, user: mockUser }, error: null })),
    signUp: vi.fn(() => Promise.resolve({ data: { session: mockSession, user: mockUser }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    onAuthStateChange: vi.fn((callback) => {
      // Immediately call with current session
      callback('SIGNED_IN', mockSession);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
  };

  const mockStorage = {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/test.pdf' } })),
      download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
      remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  };

  const mockFunctions = {
    invoke: vi.fn(() => Promise.resolve({ data: { success: true }, error: null })),
  };

  return {
    from: mockFrom,
    auth: mockAuth,
    storage: mockStorage,
    functions: mockFunctions,
  };
};

export const mockSupabase = createMockSupabaseClient();
