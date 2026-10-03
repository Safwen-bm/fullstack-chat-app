const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateFullName = (value) =>
  value.trim() ? "" : "Full name is required.";

export const validateEmail = (value) => {
  if (!value.trim()) return "Email is required.";
  return EMAIL_PATTERN.test(value.trim()) ? "" : "Please enter a valid email address.";
};

export const validatePassword = (value, minLength = 0) => {
  if (!value) return "Password is required.";
  if (minLength && value.length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  }
  return "";
};