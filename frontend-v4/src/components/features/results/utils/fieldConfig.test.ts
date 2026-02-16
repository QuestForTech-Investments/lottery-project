// @vitest-environment node
/**
 * Unit tests for Play4-only (Massachusetts) overlapping derivation functions.
 * These are pure functions tested without browser dependencies.
 */
import { describe, it, expect } from 'vitest';

// Inline the pure functions to avoid importing browser-dependent modules
// These mirror calculatePlay4OnlyFields and isPlay4OnlyDraw from fieldConfig.ts

const PLAY4_ONLY_DRAWS = ['MASS AM', 'MASS PM'];

const calculatePlay4OnlyFields = (play4: string) => {
  const r = (play4 || '').padStart(4, '0').slice(0, 4);
  return {
    num1: r[0] + r[1],
    num2: r[1] + r[2],
    num3: r[2] + r[3],
    cash3: r[0] + r[1] + r[2],
  };
};

const isPlay4OnlyDraw = (drawName: string): boolean => {
  const normalizedName = drawName.toUpperCase().trim();
  return PLAY4_ONLY_DRAWS.some(d => normalizedName.includes(d) || d.includes(normalizedName));
};

describe('calculatePlay4OnlyFields', () => {
  it('derives correct fields from "0124"', () => {
    const result = calculatePlay4OnlyFields('0124');
    expect(result.num1).toBe('01');
    expect(result.num2).toBe('12');
    expect(result.num3).toBe('24');
    expect(result.cash3).toBe('012');
  });

  it('derives correct fields from "9999"', () => {
    const result = calculatePlay4OnlyFields('9999');
    expect(result.num1).toBe('99');
    expect(result.num2).toBe('99');
    expect(result.num3).toBe('99');
    expect(result.cash3).toBe('999');
  });

  it('derives correct fields from "0000"', () => {
    const result = calculatePlay4OnlyFields('0000');
    expect(result.num1).toBe('00');
    expect(result.num2).toBe('00');
    expect(result.num3).toBe('00');
    expect(result.cash3).toBe('000');
  });

  it('pads short input "124" -> "0124"', () => {
    const result = calculatePlay4OnlyFields('124');
    expect(result.num1).toBe('01');
    expect(result.num2).toBe('12');
    expect(result.num3).toBe('24');
    expect(result.cash3).toBe('012');
  });

  it('pads empty input to "0000"', () => {
    const result = calculatePlay4OnlyFields('');
    expect(result.num1).toBe('00');
    expect(result.num2).toBe('00');
    expect(result.num3).toBe('00');
    expect(result.cash3).toBe('000');
  });

  it('truncates >4 digits: "01224" uses first 4 chars "0122"', () => {
    const result = calculatePlay4OnlyFields('01224');
    expect(result.num1).toBe('01');
    expect(result.num2).toBe('12');
    expect(result.num3).toBe('22');
    expect(result.cash3).toBe('012');
  });

  it('handles "5830" correctly', () => {
    const result = calculatePlay4OnlyFields('5830');
    expect(result.num1).toBe('58');
    expect(result.num2).toBe('83');
    expect(result.num3).toBe('30');
    expect(result.cash3).toBe('583');
  });

  it('handles "0001" with leading zeros', () => {
    const result = calculatePlay4OnlyFields('0001');
    expect(result.num1).toBe('00');
    expect(result.num2).toBe('00');
    expect(result.num3).toBe('01');
    expect(result.cash3).toBe('000');
  });
});

describe('isPlay4OnlyDraw', () => {
  it('detects "MASS AM"', () => {
    expect(isPlay4OnlyDraw('MASS AM')).toBe(true);
  });

  it('detects "MASS PM"', () => {
    expect(isPlay4OnlyDraw('MASS PM')).toBe(true);
  });

  it('detects case-insensitive', () => {
    expect(isPlay4OnlyDraw('mass am')).toBe(true);
    expect(isPlay4OnlyDraw('Mass Pm')).toBe(true);
  });

  it('rejects unrelated draws', () => {
    expect(isPlay4OnlyDraw('NACIONAL')).toBe(false);
    expect(isPlay4OnlyDraw('TEXAS AM')).toBe(false);
    expect(isPlay4OnlyDraw('GANA MAS')).toBe(false);
    expect(isPlay4OnlyDraw('LOTEKA')).toBe(false);
  });
});
