export const sanitizePhoneNumber = (input: string): string => {
  // Remove all non-digit characters using simple string operations
  let result = '';
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char >= '0' && char <= '9') {
      result += char;
    }
  }
  return result;
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const sanitized = sanitizePhoneNumber(phoneNumber);
  return sanitized.length >= 8 && sanitized.length <= 15;
};

export const formatPhoneNumber = (input: string): string => {
  return sanitizePhoneNumber(input);
};

