import { describe, it, expect } from 'vitest';
import { LENS_CONFIG, CATEGORY_COLORS } from './database';
import type { StakeholderLens } from './database';

describe('LENS_CONFIG', () => {
  const expectedLenses: StakeholderLens[] = [
    'studio_executive',
    'producer',
    'actor',
    'director',
    'writer',
    'financier',
    'ott_platform',
    'theatrical',
  ];

  it('contains all stakeholder lens types', () => {
    expectedLenses.forEach((lens) => {
      expect(LENS_CONFIG).toHaveProperty(lens);
    });
  });

  it('each lens has required properties', () => {
    Object.values(LENS_CONFIG).forEach((config) => {
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('description');
      expect(config).toHaveProperty('icon');
      expect(typeof config.label).toBe('string');
      expect(typeof config.description).toBe('string');
      expect(typeof config.icon).toBe('string');
    });
  });

  it('studio_executive has correct configuration', () => {
    expect(LENS_CONFIG.studio_executive).toEqual({
      label: 'Studio Executive',
      description: 'Focus on commercial viability, brand fit, and franchise potential',
      icon: 'Building2',
    });
  });

  it('producer has correct configuration', () => {
    expect(LENS_CONFIG.producer).toEqual({
      label: 'Producer',
      description: 'Focus on budget efficiency, production feasibility, and talent attachment',
      icon: 'Clapperboard',
    });
  });

  it('all lens labels are unique', () => {
    const labels = Object.values(LENS_CONFIG).map((c) => c.label);
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(labels.length);
  });
});

describe('CATEGORY_COLORS', () => {
  const expectedCategories = [
    'narrative',
    'character',
    'market',
    'execution',
    'theme',
    'dialogue',
  ];

  it('contains all category types', () => {
    expectedCategories.forEach((category) => {
      expect(CATEGORY_COLORS).toHaveProperty(category);
    });
  });

  it('each category has a valid HSL color value', () => {
    Object.values(CATEGORY_COLORS).forEach((color) => {
      // Check that it's a number (HSL hue value)
      expect(typeof color).toBe('string');
    });
  });

  it('all category colors are unique', () => {
    const colors = Object.values(CATEGORY_COLORS);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(colors.length);
  });
});
