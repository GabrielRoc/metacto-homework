export function validateText(text: string): string | null {
  if (text.length < 10) {
    return "Text must be at least 10 characters";
  }
  if (text.length > 500) {
    return "Text must be at most 500 characters";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email) {
    return "Email is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  return null;
}
