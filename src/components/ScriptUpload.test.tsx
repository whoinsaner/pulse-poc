import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { ScriptUpload } from './ScriptUpload';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/test.pdf' } })),
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: 'test-script-id', title: 'Test Script' }, 
            error: null 
          })),
        })),
      })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: { success: true }, error: null })),
    },
  },
}));

// Mock useAuth hook
vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    currentOrganization: { id: 'test-org-id' },
  }),
}));

describe('ScriptUpload', () => {
  const mockOnUploadComplete = vi.fn();

  beforeEach(() => {
    mockOnUploadComplete.mockClear();
  });

  it('renders the dropzone', () => {
    render(<ScriptUpload onUploadComplete={mockOnUploadComplete} />);
    
    expect(screen.getByText(/drag & drop your script/i)).toBeInTheDocument();
  });

  it('displays supported formats', () => {
    render(<ScriptUpload onUploadComplete={mockOnUploadComplete} />);
    
    expect(screen.getByText(/pdf, fdx, fountain, highland, txt/i)).toBeInTheDocument();
  });

  it('shows file size limit', () => {
    render(<ScriptUpload onUploadComplete={mockOnUploadComplete} />);
    
    expect(screen.getByText(/max 50mb/i)).toBeInTheDocument();
  });

  it('accepts PDF files', async () => {
    const user = userEvent.setup();
    render(<ScriptUpload onUploadComplete={mockOnUploadComplete} />);
    
    const file = new File(['test content'], 'test-script.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, file);
    
    // Should show the file name
    await waitFor(() => {
      expect(screen.getByText('test-script.pdf')).toBeInTheDocument();
    });
  });

  it('accepts FDX files', async () => {
    const user = userEvent.setup();
    render(<ScriptUpload onUploadComplete={mockOnUploadComplete} />);
    
    const file = new File(['<?xml version="1.0"?>'], 'test-script.fdx', { type: 'application/xml' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('test-script.fdx')).toBeInTheDocument();
    });
  });

  it('accepts Fountain files', async () => {
    const user = userEvent.setup();
    render(<ScriptUpload onUploadComplete={mockOnUploadComplete} />);
    
    const file = new File(['Title: Test'], 'test-script.fountain', { type: 'text/plain' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('test-script.fountain')).toBeInTheDocument();
    });
  });

  it('rejects unsupported file types', async () => {
    const user = userEvent.setup();
    render(<ScriptUpload onUploadComplete={mockOnUploadComplete} />);
    
    const file = new File(['test'], 'test.doc', { type: 'application/msword' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, file);
    
    // File should not be accepted
    await waitFor(() => {
      expect(screen.queryByText('test.doc')).not.toBeInTheDocument();
    });
  });

  it('shows upload button when file is selected', async () => {
    const user = userEvent.setup();
    render(<ScriptUpload onUploadComplete={mockOnUploadComplete} />);
    
    const file = new File(['test content'], 'test-script.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    });
  });

  it('allows removing selected file', async () => {
    const user = userEvent.setup();
    render(<ScriptUpload onUploadComplete={mockOnUploadComplete} />);
    
    const file = new File(['test content'], 'test-script.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('test-script.pdf')).toBeInTheDocument();
    });
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('test-script.pdf')).not.toBeInTheDocument();
    });
  });
});
