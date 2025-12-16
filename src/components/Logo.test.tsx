import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Logo } from './Logo';

describe('Logo', () => {
  it('renders the logo text', () => {
    render(<Logo />);
    expect(screen.getByText('PULSE')).toBeInTheDocument();
  });

  it('applies default size classes', () => {
    render(<Logo />);
    const logo = screen.getByText('PULSE').closest('div');
    expect(logo).toHaveClass('text-2xl');
  });

  it('applies small size classes when size="sm"', () => {
    render(<Logo size="sm" />);
    const logo = screen.getByText('PULSE').closest('div');
    expect(logo).toHaveClass('text-lg');
  });

  it('applies large size classes when size="lg"', () => {
    render(<Logo size="lg" />);
    const logo = screen.getByText('PULSE').closest('div');
    expect(logo).toHaveClass('text-4xl');
  });

  it('renders with custom className', () => {
    render(<Logo className="custom-class" />);
    const logoContainer = screen.getByText('PULSE').closest('div')?.parentElement;
    expect(logoContainer).toHaveClass('custom-class');
  });

  it('contains the animated pulse element', () => {
    const { container } = render(<Logo />);
    const pulseElement = container.querySelector('.animate-pulse-slow');
    expect(pulseElement).toBeInTheDocument();
  });
});
