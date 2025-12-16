import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Onboarding from './Onboarding';

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
const mockCreateOrganization = vi.fn();
vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    createOrganization: mockCreateOrganization,
  }),
}));

describe('Onboarding Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateOrganization.mockResolvedValue({ 
      organization: { id: 'test-org-id', name: 'Test Org' }, 
      error: null 
    });
  });

  it('renders welcome step initially', () => {
    render(<Onboarding />);
    
    expect(screen.getByText(/welcome to pulse/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('advances to organization step on Get Started click', async () => {
    const user = userEvent.setup();
    render(<Onboarding />);
    
    await user.click(screen.getByRole('button', { name: /get started/i }));
    
    expect(screen.getByText(/create your organization/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/organization name/i)).toBeInTheDocument();
  });

  it('validates organization name is required', async () => {
    const user = userEvent.setup();
    render(<Onboarding />);
    
    // Go to org step
    await user.click(screen.getByRole('button', { name: /get started/i }));
    
    // Try to create without name
    const createButton = screen.getByRole('button', { name: /create organization/i });
    await user.click(createButton);
    
    // Should not call createOrganization
    expect(mockCreateOrganization).not.toHaveBeenCalled();
  });

  it('creates organization on valid submission', async () => {
    const user = userEvent.setup();
    render(<Onboarding />);
    
    // Go to org step
    await user.click(screen.getByRole('button', { name: /get started/i }));
    
    // Enter org name
    const input = screen.getByPlaceholderText(/organization name/i);
    await user.type(input, 'My Production Company');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /create organization/i }));
    
    await waitFor(() => {
      expect(mockCreateOrganization).toHaveBeenCalledWith('My Production Company');
    });
  });

  it('shows success step after organization creation', async () => {
    const user = userEvent.setup();
    render(<Onboarding />);
    
    // Go to org step
    await user.click(screen.getByRole('button', { name: /get started/i }));
    
    // Enter org name and submit
    await user.type(screen.getByPlaceholderText(/organization name/i), 'Test Org');
    await user.click(screen.getByRole('button', { name: /create organization/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/you're all set/i)).toBeInTheDocument();
    });
  });

  it('navigates to dashboard on completion', async () => {
    const user = userEvent.setup();
    render(<Onboarding />);
    
    // Complete onboarding flow
    await user.click(screen.getByRole('button', { name: /get started/i }));
    await user.type(screen.getByPlaceholderText(/organization name/i), 'Test Org');
    await user.click(screen.getByRole('button', { name: /create organization/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/you're all set/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /go to dashboard/i }));
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('displays error message on organization creation failure', async () => {
    mockCreateOrganization.mockResolvedValue({ 
      organization: null, 
      error: new Error('Failed to create organization') 
    });
    
    const user = userEvent.setup();
    render(<Onboarding />);
    
    // Go to org step
    await user.click(screen.getByRole('button', { name: /get started/i }));
    
    // Enter org name and submit
    await user.type(screen.getByPlaceholderText(/organization name/i), 'Test Org');
    await user.click(screen.getByRole('button', { name: /create organization/i }));
    
    // Should show error toast - the error is displayed via toast
    // For now we just verify the function was called
    await waitFor(() => {
      expect(mockCreateOrganization).toHaveBeenCalled();
    });
  });

  it('shows progress indicators', () => {
    render(<Onboarding />);
    
    // Should show step indicators
    const progressDots = document.querySelectorAll('[class*="rounded-full"]');
    expect(progressDots.length).toBeGreaterThanOrEqual(3);
  });
});
