import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Scripts from './Scripts';

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
const mockUseAuth = vi.fn();
vi.mock('@/lib/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock supabase
const mockSelect = vi.fn();
const mockDelete = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: mockSelect,
        }),
      }),
      delete: () => ({
        eq: mockDelete,
      }),
    }),
  },
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockScripts = [
  {
    id: 'script-1',
    title: 'The Great Adventure',
    format: 'fountain',
    script_type: 'feature',
    created_at: '2024-01-15T10:00:00Z',
    page_count: 120,
    logline: 'An epic tale of discovery',
    organization_id: 'org-1',
    uploaded_by: 'user-1',
    file_url: '/scripts/test.fountain',
  },
  {
    id: 'script-2',
    title: 'City Lights',
    format: 'pdf',
    script_type: 'pilot',
    created_at: '2024-01-10T10:00:00Z',
    page_count: 60,
    logline: null,
    organization_id: 'org-1',
    uploaded_by: 'user-1',
    file_url: '/scripts/test.pdf',
  },
];

describe('Scripts Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockResolvedValue({ data: mockScripts, error: null });
    mockDelete.mockResolvedValue({ error: null });
  });

  it('shows loading skeleton while auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      currentOrganization: null,
      userRole: null,
      isLoading: true,
    });

    render(<Scripts />);

    const skeletons = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('redirects to auth when not logged in', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      currentOrganization: null,
      userRole: null,
      isLoading: false,
    });

    render(<Scripts />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });

  it('redirects to onboarding when no organization', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      currentOrganization: null,
      userRole: null,
      isLoading: false,
    });

    render(<Scripts />);

    expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
  });

  it('renders scripts list', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
      userRole: 'analyst',
      isLoading: false,
    });

    render(<Scripts />);

    await waitFor(() => {
      expect(screen.getByText('The Great Adventure')).toBeInTheDocument();
    });

    expect(screen.getByText('City Lights')).toBeInTheDocument();
    expect(screen.getByText('2 scripts in Test Studio')).toBeInTheDocument();
  });

  it('shows empty state when no scripts', async () => {
    mockSelect.mockResolvedValue({ data: [], error: null });
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
      userRole: 'analyst',
      isLoading: false,
    });

    render(<Scripts />);

    await waitFor(() => {
      expect(screen.getByText('No scripts yet')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /upload script/i })).toBeInTheDocument();
  });

  it('displays script format and type badges', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
      userRole: 'analyst',
      isLoading: false,
    });

    render(<Scripts />);

    await waitFor(() => {
      expect(screen.getByText('Fountain')).toBeInTheDocument();
    });

    expect(screen.getByText('Feature Film')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('TV Pilot')).toBeInTheDocument();
  });

  it('navigates to upload page on Upload Script click', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
      userRole: 'analyst',
      isLoading: false,
    });

    const user = userEvent.setup();
    render(<Scripts />);

    await waitFor(() => {
      expect(screen.getByText('Script Library')).toBeInTheDocument();
    });

    // Click header upload button
    const uploadButtons = screen.getAllByRole('button', { name: /upload script/i });
    await user.click(uploadButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/upload');
  });

  it('navigates to analysis page on script card click', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
      userRole: 'analyst',
      isLoading: false,
    });

    const user = userEvent.setup();
    render(<Scripts />);

    await waitFor(() => {
      expect(screen.getByText('The Great Adventure')).toBeInTheDocument();
    });

    const scriptCard = screen.getByText('The Great Adventure').closest('[class*="card"]');
    await user.click(scriptCard!);

    expect(mockNavigate).toHaveBeenCalledWith('/analysis/script-1');
  });

  it('shows delete option only for admins', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
      userRole: 'viewer',
      isLoading: false,
    });

    const user = userEvent.setup();
    render(<Scripts />);

    await waitFor(() => {
      expect(screen.getByText('The Great Adventure')).toBeInTheDocument();
    });

    // Find and click the menu button
    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons.find(btn => btn.querySelector('svg[class*="more-vertical"]'));
    
    if (menuButton) {
      await user.click(menuButton);
      // Delete option should not be visible for non-admins
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    }
  });

  it('handles fetch error gracefully', async () => {
    mockSelect.mockResolvedValue({ data: null, error: new Error('Fetch failed') });
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
      userRole: 'analyst',
      isLoading: false,
    });

    render(<Scripts />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          variant: 'destructive',
        })
      );
    });
  });
});
