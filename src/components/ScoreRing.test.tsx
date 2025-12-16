import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { ScoreRing } from './ScoreRing';

describe('ScoreRing', () => {
  it('renders the score value', () => {
    render(<ScoreRing score={75} />);
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('renders the label when provided', () => {
    render(<ScoreRing score={80} label="Test Score" />);
    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('applies green color class for high scores (>=70)', () => {
    const { container } = render(<ScoreRing score={75} />);
    const circle = container.querySelector('circle:last-child');
    expect(circle).toHaveClass('text-score-high');
  });

  it('applies yellow color class for medium scores (40-69)', () => {
    const { container } = render(<ScoreRing score={55} />);
    const circle = container.querySelector('circle:last-child');
    expect(circle).toHaveClass('text-score-medium');
  });

  it('applies red color class for low scores (<40)', () => {
    const { container } = render(<ScoreRing score={30} />);
    const circle = container.querySelector('circle:last-child');
    expect(circle).toHaveClass('text-score-low');
  });

  it('applies correct size classes for sm size', () => {
    const { container } = render(<ScoreRing score={50} size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '60');
    expect(svg).toHaveAttribute('height', '60');
  });

  it('applies correct size classes for lg size', () => {
    const { container } = render(<ScoreRing score={50} size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '140');
    expect(svg).toHaveAttribute('height', '140');
  });

  it('clamps score to maximum of 100', () => {
    render(<ScoreRing score={150} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('clamps score to minimum of 0', () => {
    render(<ScoreRing score={-10} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
