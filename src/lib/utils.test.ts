import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base', isActive && 'active');
    expect(result).toBe('base active');
  });

  it('filters out falsy values', () => {
    const result = cn('base', false, null, undefined, 'valid');
    expect(result).toBe('base valid');
  });

  it('handles Tailwind class conflicts correctly', () => {
    // tailwind-merge should keep the last conflicting class
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('handles complex Tailwind conflicts', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('preserves non-conflicting classes', () => {
    const result = cn('text-lg', 'font-bold', 'text-lg', 'mt-4');
    expect(result).toBe('text-lg font-bold mt-4');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles objects with boolean values', () => {
    const result = cn({
      base: true,
      active: true,
      disabled: false,
    });
    expect(result).toBe('base active');
  });

  it('returns empty string for no input', () => {
    const result = cn();
    expect(result).toBe('');
  });
});
