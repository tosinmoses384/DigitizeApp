import { truncateByCharacters } from '../helper/truncateText';

describe('truncateByCharacters', () => {
  it('should return the original text if shorter than maxLength', () => {
    expect(truncateByCharacters('hello', 10)).toBe('hello');
  });

  it('should truncate text and append ellipsis when exceeding maxLength', () => {
    expect(truncateByCharacters('hello world', 5)).toBe('hello...');
  });

  it('should return the exact text when length equals maxLength', () => {
    expect(truncateByCharacters('hello', 5)).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(truncateByCharacters('', 5)).toBe('');
  });

  it('should handle maxLength of 0', () => {
    expect(truncateByCharacters('hello', 0)).toBe('...');
  });
});
