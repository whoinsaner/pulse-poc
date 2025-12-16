import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { ScriptUpload } from './ScriptUpload';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/lib/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock supabase
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockInsert = vi.fn();
const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
    from: () => ({
      insert: () => ({
        select: () => ({
          single: mockInsert,
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

describe('ScriptUpload Integration', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockOrg = { id: 'org-123', name: 'Test Studio' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      currentOrganization: mockOrg,
    });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/file.pdf' } });
  });

  it('shows error toast when missing user or organization', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      currentOrganization: null,
    });

    const user = userEvent.setup();
    render(<ScriptUpload />);

    // Create and drop a file
    const file = new File(['test content'], 'test-script.fountain', { type: 'text/plain' });
    const dropzone = screen.getByText(/drag & drop your script/i).closest('div');

    // Manually trigger the file selection
    const input = dropzone!.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    // Click upload button
    const uploadButton = await screen.findByRole('button', { name: /upload & analyze/i });
    await user.click(uploadButton);

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error',
        variant: 'destructive',
      })
    );
  });

  it('uploads file and creates script record on success', async () => {
    mockUpload.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({
      data: { id: 'script-123', title: 'Test Script' },
      error: null,
    });
    mockInvoke.mockResolvedValue({ error: null });

    const onUploadComplete = vi.fn();
    const user = userEvent.setup();

    render(<ScriptUpload onUploadComplete={onUploadComplete} />);

    // Upload a fountain file
    const file = new File(['INT. OFFICE - DAY\n\nJOHN walks in.'], 'my-script.fountain', {
      type: 'text/plain',
    });

    const dropzone = screen.getByText(/drag & drop your script/i).closest('div');
    const input = dropzone!.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    // Should show file preview
    expect(await screen.findByText('my-script.fountain')).toBeInTheDocument();
    expect(screen.getByText(/fountain/i)).toBeInTheDocument();

    // Should auto-fill title
    const titleInput = screen.getByPlaceholderText(/enter script title/i) as HTMLInputElement;
    expect(titleInput.value).toBe('my-script');

    // Click upload
    const uploadButton = screen.getByRole('button', { name: /upload & analyze/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('script-parser', expect.any(Object));
    });

    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalledWith('script-123');
    });
  });

  it('handles upload error gracefully', async () => {
    mockUpload.mockResolvedValue({ error: new Error('Storage error') });

    const user = userEvent.setup();
    render(<ScriptUpload />);

    const file = new File(['content'], 'test.fountain', { type: 'text/plain' });
    const dropzone = screen.getByText(/drag & drop your script/i).closest('div');
    const input = dropzone!.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    await user.click(screen.getByRole('button', { name: /upload & analyze/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Upload failed',
          variant: 'destructive',
        })
      );
    });
  });

  it('shows parsing error toast but completes upload when parser fails', async () => {
    mockUpload.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({
      data: { id: 'script-123', title: 'Test Script' },
      error: null,
    });
    mockInvoke.mockResolvedValue({ error: new Error('Parse failed') });

    const user = userEvent.setup();
    render(<ScriptUpload />);

    const file = new File(['content'], 'test.fountain', { type: 'text/plain' });
    const dropzone = screen.getByText(/drag & drop your script/i).closest('div');
    const input = dropzone!.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    await user.click(screen.getByRole('button', { name: /upload & analyze/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringMatching(/parsing will continue/i),
        })
      );
    });

    // Should still show complete state
    await waitFor(() => {
      expect(screen.getByText(/upload complete/i)).toBeInTheDocument();
    });
  });

  it('allows selecting different script types', async () => {
    const user = userEvent.setup();
    render(<ScriptUpload />);

    const file = new File(['content'], 'test.fountain', { type: 'text/plain' });
    const dropzone = screen.getByText(/drag & drop your script/i).closest('div');
    const input = dropzone!.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    // Should show script type buttons
    expect(screen.getByRole('button', { name: /feature/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pilot/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /episode/i })).toBeInTheDocument();

    // Select pilot type
    await user.click(screen.getByRole('button', { name: /pilot/i }));

    // The pilot button should be styled as selected (primary variant)
    const pilotButton = screen.getByRole('button', { name: /pilot/i });
    expect(pilotButton.className).toContain('bg-primary');
  });

  it('rejects unsupported file formats', async () => {
    const user = userEvent.setup();
    render(<ScriptUpload />);

    const file = new File(['content'], 'test.doc', { type: 'application/msword' });
    const dropzone = screen.getByText(/drag & drop your script/i).closest('div');
    const input = dropzone!.querySelector('input[type="file"]') as HTMLInputElement;

    // Try to upload unsupported file
    await user.upload(input, file);

    // Should show error
    expect(screen.getByText(/unsupported file format/i)).toBeInTheDocument();
  });

  it('allows resetting the upload', async () => {
    const user = userEvent.setup();
    render(<ScriptUpload />);

    const file = new File(['content'], 'test.fountain', { type: 'text/plain' });
    const dropzone = screen.getByText(/drag & drop your script/i).closest('div');
    const input = dropzone!.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    // File should be shown
    expect(screen.getByText('test.fountain')).toBeInTheDocument();

    // Click the remove button (X icon)
    const removeButton = screen.getAllByRole('button').find((btn) =>
      btn.querySelector('svg[class*="lucide-x"]')
    );
    await user.click(removeButton!);

    // Should be back to dropzone
    expect(screen.getByText(/drag & drop your script/i)).toBeInTheDocument();
  });
});
