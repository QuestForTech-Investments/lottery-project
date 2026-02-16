// @vitest-environment node
/**
 * Unit tests for "Más" lottery derivation functions.
 * These are pure functions tested without browser dependencies.
 */
import { describe, it, expect } from 'vitest';

// Inline the pure functions to avoid importing browser-dependent modules
// These mirror calculateMasFields and isMasDraw from fieldConfig.ts

const MAS_DRAWS = ['GANA MAS', 'MAS AM', 'MAS PM'];

const calculateMasFields = (result4: string) => {
  const r = (result4 || '').padStart(4, '0').slice(0, 4);
  return {
    num1: r[0] + r[1],
    num2: r[1] + r[2],
    num3: r[2] + r[3],
    cash3: r[0] + r[1] + r[2],
  };
};

const isMasDraw = (drawName: string): boolean => {
  const normalizedName = drawName.toUpperCase().trim();
  return MAS_DRAWS.some(d => normalizedName.includes(d) || d.includes(normalizedName));
};

describe('calculateMasFields', () => {
  it('derives correct fields from "0124"', () => {
    const result = calculateMasFields('0124');
    expect(result.num1).toBe('01');
    expect(result.num2).toBe('12');
    expect(result.num3).toBe('24');
    expect(result.cash3).toBe('012');
  });

  it('derives correct fields from "9999"', () => {
    const result = calculateMasFields('9999');
    expect(result.num1).toBe('99');
    expect(result.num2).toBe('99');
    expect(result.num3).toBe('99');
    expect(result.cash3).toBe('999');
  });

  it('derives correct fields from "0000"', () => {
    const result = calculateMasFields('0000');
    expect(result.num1).toBe('00');
    expect(result.num2).toBe('00');
    expect(result.num3).toBe('00');
    expect(result.cash3).toBe('000');
  });

  it('pads short input "124" -> "0124"', () => {
    const result = calculateMasFields('124');
    expect(result.num1).toBe('01');
    expect(result.num2).toBe('12');
    expect(result.num3).toBe('24');
    expect(result.cash3).toBe('012');
  });

  it('pads empty input to "0000"', () => {
    const result = calculateMasFields('');
    expect(result.num1).toBe('00');
    expect(result.num2).toBe('00');
    expect(result.num3).toBe('00');
    expect(result.cash3).toBe('000');
  });

  it('truncates >4 digits: "01224" uses first 4 chars "0122"', () => {
    const result = calculateMasFields('01224');
    expect(result.num1).toBe('01');
    expect(result.num2).toBe('12');
    expect(result.num3).toBe('22');
    expect(result.cash3).toBe('012');
  });

  it('handles "5830" correctly', () => {
    const result = calculateMasFields('5830');
    expect(result.num1).toBe('58');
    expect(result.num2).toBe('83');
    expect(result.num3).toBe('30');
    expect(result.cash3).toBe('583');
  });

  it('handles "0001" with leading zeros', () => {
    const result = calculateMasFields('0001');
    expect(result.num1).toBe('00');
    expect(result.num2).toBe('00');
    expect(result.num3).toBe('01');
    expect(result.cash3).toBe('000');
  });
});

describe('isMasDraw', () => {
  it('detects "GANA MAS"', () => {
    expect(isMasDraw('GANA MAS')).toBe(true);
  });

  it('detects case-insensitive', () => {
    expect(isMasDraw('Gana Mas')).toBe(true);
    expect(isMasDraw('gana mas')).toBe(true);
  });

  it('detects "MAS AM" and "MAS PM"', () => {
    expect(isMasDraw('MAS AM')).toBe(true);
    expect(isMasDraw('MAS PM')).toBe(true);
  });

  it('rejects unrelated draws', () => {
    expect(isMasDraw('NACIONAL')).toBe(false);
    expect(isMasDraw('TEXAS AM')).toBe(false);
    expect(isMasDraw('MASS AM')).toBe(false);
    expect(isMasDraw('LOTEKA')).toBe(false);
  });
});
