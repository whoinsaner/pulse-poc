import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { AnalysisTrigger } from './AnalysisTrigger';

// Mock useAuth
const mockUser = { id: 'user-123', email: 'test@example.com' };
vi.mock('@/lib/auth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock supabase
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      insert: () => ({
        select: () => ({
          single: mockInsert,
        }),
      }),
      select: () => ({
        eq: () => ({
          single: mockSelect,
        }),
      }),
    }),
    functions: {
      invoke: mockInvoke,
    },
  },
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('AnalysisTrigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({
      data: { id: 'run-123', status: 'pending' },
      error: null,
    });
    mockSelect.mockResolvedValue({
      data: { status: 'processing', agent_progress: {} },
      error: null,
    });
    mockInvoke.mockResolvedValue({ error: null });
  });

  it('renders start button initially', () => {
    render(
      <AnalysisTrigger
        scriptId="script-123"
        scriptTitle="Test Script"
      />
    );

    expect(screen.getByRole('button', { name: /run ai analysis/i })).toBeInTheDocument();
  });

  it('starts analysis on button click', async () => {
    const user = userEvent.setup();
    
    render(
      <AnalysisTrigger
        scriptId="script-123"
        scriptTitle="Test Script"
      />
    );

    await user.click(screen.getByRole('button', { name: /run ai analysis/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('analyze-script', {
        body: {
          scriptId: 'script-123',
          analysisRunId: 'run-123',
        },
      });
    });
  });

  it('shows progress during analysis', async () => {
    mockSelect.mockResolvedValue({
      data: {
        status: 'processing',
        agent_progress: {
          StructureAgent: { status: 'completed' },
          CharacterAgent: { status: 'running' },
          ConflictAgent: { status: 'pending' },
        },
      },
      error: null,
    });

    const user = userEvent.setup();
    
    render(
      <AnalysisTrigger
        scriptId="script-123"
        scriptTitle="Test Script"
      />
    );

    await user.click(screen.getByRole('button', { name: /run ai analysis/i }));

    await waitFor(() => {
      expect(screen.getByText(/analyzing script/i)).toBeInTheDocument();
    });
  });

  it('handles analysis error', async () => {
    mockInsert.mockResolvedValue({
      data: null,
      error: new Error('Database error'),
    });

    const user = userEvent.setup();
    
    render(
      <AnalysisTrigger
        scriptId="script-123"
        scriptTitle="Test Script"
      />
    );

    await user.click(screen.getByRole('button', { name: /run ai analysis/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          variant: 'destructive',
        })
      );
    });
  });

  it('calls onAnalysisComplete when analysis finishes', async () => {
    let pollCount = 0;
    mockSelect.mockImplementation(() => {
      pollCount++;
      return {
        data: {
          status: pollCount > 1 ? 'completed' : 'processing',
          agent_progress: {},
        },
        error: null,
      };
    });

    const onComplete = vi.fn();
    const user = userEvent.setup();
    
    render(
      <AnalysisTrigger
        scriptId="script-123"
        scriptTitle="Test Script"
        onAnalysisComplete={onComplete}
      />
    );

    await user.click(screen.getByRole('button', { name: /run ai analysis/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Analysis complete',
        })
      );
    }, { timeout: 5000 });
  });
});
