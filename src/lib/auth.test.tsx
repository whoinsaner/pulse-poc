import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@/test/utils';
import { AuthProvider, useAuth } from './auth';
import { mockUser, mockSession, mockOrganization, mockProfile } from '@/test/mocks/supabase';
import React from 'react';

// Mock supabase client
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockFromSelect = vi.fn();
const mockFromInsert = vi.fn();
const mockFromUpdate = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: (event: string, session: typeof mockSession | null) => void) => 
        mockOnAuthStateChange(callback),
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mockFromSelect,
            }),
          }),
          update: () => ({
            eq: mockFromUpdate,
          }),
        };
      }
      if (table === 'user_roles') {
        return {
          select: () => ({
            eq: mockFromSelect,
          }),
          insert: mockFromInsert,
        };
      }
      if (table === 'organizations') {
        return {
          select: () => ({
            in: mockFromSelect,
          }),
          insert: () => ({
            select: () => ({
              single: mockFromInsert,
            }),
          }),
        };
      }
      return {
        select: () => ({ eq: () => ({ maybeSingle: mockFromSelect }) }),
        insert: mockFromInsert,
        update: () => ({ eq: mockFromUpdate }),
      };
    },
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockImplementation((callback) => {
      callback('SIGNED_OUT', null);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    mockFromSelect.mockResolvedValue({ data: null, error: null });
    mockFromInsert.mockResolvedValue({ data: null, error: null });
    mockFromUpdate.mockResolvedValue({ data: null, error: null });
  });

  it('throws error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('initializes with null user when not authenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('sets user data when authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockOnAuthStateChange.mockImplementation((callback) => {
      callback('SIGNED_IN', mockSession);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    mockFromSelect
      .mockResolvedValueOnce({ data: mockProfile, error: null }) // profiles
      .mockResolvedValueOnce({ data: [{ organization_id: mockOrganization.id, role: 'admin' }], error: null }) // user_roles
      .mockResolvedValueOnce({ data: [mockOrganization], error: null }); // organizations
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
  });

  describe('signIn', () => {
    it('calls supabase signInWithPassword', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });
      
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('returns error on failed sign in', async () => {
      const mockError = new Error('Invalid credentials');
      mockSignInWithPassword.mockResolvedValue({ error: mockError });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      let signInResult: { error: Error | null };
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'wrongpassword');
      });
      
      expect(signInResult!.error).toEqual(mockError);
    });
  });

  describe('signUp', () => {
    it('calls supabase signUp with email redirect', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.signUp('new@example.com', 'password123', 'New User');
      });
      
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.stringContaining('/'),
          data: {
            full_name: 'New User',
          },
        },
      });
    });

    it('returns error on failed sign up', async () => {
      const mockError = new Error('Email already registered');
      mockSignUp.mockResolvedValue({ error: mockError });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      let signUpResult: { error: Error | null };
      await act(async () => {
        signUpResult = await result.current.signUp('existing@example.com', 'password123', 'User');
      });
      
      expect(signUpResult!.error).toEqual(mockError);
    });
  });

  describe('signOut', () => {
    it('calls supabase signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.signOut();
      });
      
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('createOrganization', () => {
    it('returns error when not authenticated', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      let createResult: { organization: unknown; error: Error | null };
      await act(async () => {
        createResult = await result.current.createOrganization('Test Org');
      });
      
      expect(createResult!.error?.message).toBe('Not authenticated');
      expect(createResult!.organization).toBeNull();
    });
  });
});
