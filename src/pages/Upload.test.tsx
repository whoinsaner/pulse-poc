import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Upload from './Upload';

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

describe('Upload Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to auth when not logged in', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      currentOrganization: null,
    });

    render(<Upload />);

    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('redirects to onboarding when no organization', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      currentOrganization: null,
    });

    render(<Upload />);

    expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
  });

  it('renders upload page when authenticated with organization', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
    });

    render(<Upload />);

    expect(screen.getByText('Upload a Script')).toBeInTheDocument();
    expect(screen.getByText('Test Studio')).toBeInTheDocument();
  });

  it('shows format information cards', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
    });

    render(<Upload />);

    expect(screen.getByText('Best Formats')).toBeInTheDocument();
    expect(screen.getByText('Also Supported')).toBeInTheDocument();
    expect(screen.getByText(/Fountain/)).toBeInTheDocument();
    expect(screen.getByText(/Final Draft/)).toBeInTheDocument();
  });

  it('navigates back to dashboard on back button click', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      currentOrganization: { id: 'org-1', name: 'Test Studio' },
    });

    const user = userEvent.setup();
    render(<Upload />);

    // Find the back button (first button with ArrowLeft icon)
    const backButton = screen.getAllByRole('button')[0];
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
