import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useAuth
const mockSignOut = vi.fn();
const mockUseAuth = vi.fn();
vi.mock('@/lib/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
  });

  it('shows loading skeleton while auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      currentOrganization: null,
      userRole: null,
      isLoading: true,
      signOut: mockSignOut,
    });

    render(<Dashboard />);

    // Should show skeleton elements
    const skeletons = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('redirects to auth when not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      currentOrganization: null,
      userRole: null,
      isLoading: false,
      signOut: mockSignOut,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });

  it('shows create organization prompt when no organization', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      profile: { full_name: 'Test User', email: 'test@example.com' },
      currentOrganization: null,
      userRole: null,
      isLoading: false,
      signOut: mockSignOut,
    });

    render(<Dashboard />);

    expect(screen.getByText('No Organization Found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create organization/i })).toBeInTheDocument();
  });

  it('renders dashboard with organization', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      profile: { full_name: 'John Doe', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Acme Studios' },
      userRole: 'admin',
      isLoading: false,
      signOut: mockSignOut,
    });

    render(<Dashboard />);

    expect(screen.getByText(/welcome back, john/i)).toBeInTheDocument();
    expect(screen.getByText(/Acme Studios/)).toBeInTheDocument();
  });

  it('shows quick action cards', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      profile: { full_name: 'Test User', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
      userRole: 'analyst',
      isLoading: false,
      signOut: mockSignOut,
    });

    render(<Dashboard />);

    expect(screen.getByText('Upload Script')).toBeInTheDocument();
    expect(screen.getByText('Script Library')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('shows Team card for admins only', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      profile: { full_name: 'Admin User', email: 'admin@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
      userRole: 'admin',
      isLoading: false,
      signOut: mockSignOut,
    });

    render(<Dashboard />);

    expect(screen.getByText('Team')).toBeInTheDocument();
  });

  it('hides Team card for non-admins', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      profile: { full_name: 'Viewer User', email: 'viewer@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
      userRole: 'viewer',
      isLoading: false,
      signOut: mockSignOut,
    });

    render(<Dashboard />);

    expect(screen.queryByText('Team')).not.toBeInTheDocument();
  });

  it('navigates to upload page on Upload Script click', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      profile: { full_name: 'Test User', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
      userRole: 'analyst',
      isLoading: false,
      signOut: mockSignOut,
    });

    const user = userEvent.setup();
    render(<Dashboard />);

    // Click on the Upload Script card
    const uploadCard = screen.getByText('Upload Script').closest('[class*="card"]');
    await user.click(uploadCard!);

    expect(mockNavigate).toHaveBeenCalledWith('/upload');
  });

  it('calls signOut on logout button click', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      profile: { full_name: 'Test User', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
      userRole: 'analyst',
      isLoading: false,
      signOut: mockSignOut,
    });

    const user = userEvent.setup();
    render(<Dashboard />);

    // Find and click the logout button
    const logoutButton = screen.getByRole('button', { name: '' }); // Icon-only button
    await user.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });
});
