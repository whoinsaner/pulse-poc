import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { LensToggle, LensSelector } from './LensToggle';
import { LENS_CONFIG } from '@/types/database';
import type { StakeholderLens } from '@/types/database';

describe('LensToggle', () => {
  const mockOnLensChange = vi.fn();
  const defaultLens: StakeholderLens = 'studio_executive';

  beforeEach(() => {
    mockOnLensChange.mockClear();
  });

  it('renders with the active lens highlighted', () => {
    render(<LensToggle activeLens={defaultLens} onLensChange={mockOnLensChange} />);
    
    // Check that the component renders
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(8); // 8 lenses
  });

  it('calls onLensChange when a lens is clicked', async () => {
    const user = userEvent.setup();
    render(<LensToggle activeLens={defaultLens} onLensChange={mockOnLensChange} />);
    
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]); // Click second lens (producer)
    
    expect(mockOnLensChange).toHaveBeenCalledWith('producer');
  });

  it('renders all lens options', () => {
    render(<LensToggle activeLens={defaultLens} onLensChange={mockOnLensChange} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(8);
  });

  it('renders compact version when compact prop is true', () => {
    const { container } = render(
      <LensToggle activeLens={defaultLens} onLensChange={mockOnLensChange} compact />
    );
    
    // Compact version should still render all buttons
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(8);
  });
});

describe('LensSelector', () => {
  const mockOnLensChange = vi.fn();
  const defaultLens: StakeholderLens = 'producer';

  beforeEach(() => {
    mockOnLensChange.mockClear();
  });

  it('renders with the active lens label', () => {
    render(<LensSelector activeLens={defaultLens} onLensChange={mockOnLensChange} />);
    
    expect(screen.getByText(LENS_CONFIG[defaultLens].label)).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    render(<LensSelector activeLens={defaultLens} onLensChange={mockOnLensChange} />);
    
    const trigger = screen.getAllByRole('button')[0];
    await user.click(trigger);
    
    // Should show all lens options in dropdown - should have 9 buttons total (1 trigger + 8 lens options)
    const allButtons = screen.getAllByRole('button');
    expect(allButtons.length).toBe(9);
  });
});
