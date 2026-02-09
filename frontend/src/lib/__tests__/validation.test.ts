import { describe, it, expect } from "vitest";
import { validateText, validateEmail } from "../validation";

describe("validateText", () => {
  it("returns null for valid text", () => {
    expect(validateText("This is a valid feature proposal")).toBeNull();
  });

  it("returns error for text shorter than 10 characters", () => {
    expect(validateText("Short")).toBe("Text must be at least 10 characters");
  });

  it("returns error for text longer than 500 characters", () => {
    const longText = "a".repeat(501);
    expect(validateText(longText)).toBe("Text must be at most 500 characters");
  });

  it("returns null for text with exactly 10 characters", () => {
    expect(validateText("a".repeat(10))).toBeNull();
  });

  it("returns null for text with exactly 500 characters", () => {
    expect(validateText("a".repeat(500))).toBeNull();
  });

  it("returns error for empty text", () => {
    expect(validateText("")).toBe("Text must be at least 10 characters");
  });
});

describe("validateEmail", () => {
  it("returns null for valid email", () => {
    expect(validateEmail("user@example.com")).toBeNull();
  });

  it("returns error for empty email", () => {
    expect(validateEmail("")).toBe("Email is required");
  });

  it("returns error for invalid email format", () => {
    expect(validateEmail("invalid-email")).toBe("Invalid email format");
  });

  it("returns error for email without domain", () => {
    expect(validateEmail("user@")).toBe("Invalid email format");
  });

  it("returns error for email without @", () => {
    expect(validateEmail("userexample.com")).toBe("Invalid email format");
  });
});
