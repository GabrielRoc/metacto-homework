import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import AppSnackbar from "../AppSnackbar";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("AppSnackbar", () => {
  it("renders message when open", () => {
    render(
      <AppSnackbar open={true} message="Something went wrong" onClose={() => {}} />
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it('defaults to "error" severity', () => {
    render(
      <AppSnackbar open={true} message="Error message" onClose={() => {}} />
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("MuiAlert-filledError");
  });
});
