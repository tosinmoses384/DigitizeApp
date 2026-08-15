import { capitalizeFirstLetter } from '../helper/capitalize-first-letter';

describe('capitalizeFirstLetter', () => {
  it('should capitalize the first letter of a lowercase string', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
  });

  it('should return the same string if already capitalized', () => {
    expect(capitalizeFirstLetter('Hello')).toBe('Hello');
  });

  it('should handle single character strings', () => {
    expect(capitalizeFirstLetter('a')).toBe('A');
  });

  it('should return empty string for empty input', () => {
    expect(capitalizeFirstLetter('')).toBe('');
  });

  it('should handle null/undefined gracefully', () => {
    expect(capitalizeFirstLetter(null as unknown as string)).toBe('');
    expect(capitalizeFirstLetter(undefined as unknown as string)).toBe('');
  });

  it('should not modify non-alphabetic first characters', () => {
    expect(capitalizeFirstLetter('123abc')).toBe('123abc');
  });

  it('should only capitalize the first letter, leaving the rest unchanged', () => {
    expect(capitalizeFirstLetter('hELLO wORLD')).toBe('HELLO wORLD');
  });
});
