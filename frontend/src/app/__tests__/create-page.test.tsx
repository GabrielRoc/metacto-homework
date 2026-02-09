import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateFeaturePage from "../create/page";

const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

vi.mock("@/lib/api", () => ({
  createFeature: vi.fn(),
}));

import { createFeature } from "@/lib/api";

const mockCreateFeature = vi.mocked(createFeature);

beforeEach(() => {
  vi.clearAllMocks();
  Storage.prototype.getItem = vi.fn((key: string) => {
    if (key === "savedEmail") return "test@email.com";
    return null;
  });
});

afterEach(() => {
  cleanup();
});

function getTextArea(container: HTMLElement) {
  // MUI multiline TextField renders two textareas; get the visible one (not aria-hidden)
  const textareas = container.querySelectorAll("textarea:not([aria-hidden])");
  return textareas[0] as HTMLTextAreaElement;
}

describe("CreateFeaturePage", () => {
  it("shows validation error for text that is too short", async () => {
    const user = userEvent.setup();

    const { container } = render(<CreateFeaturePage />);

    const textField = getTextArea(container);

    await user.type(textField, "Short");
    await user.click(screen.getByRole("button", { name: /submit proposal/i }));

    expect(screen.getByText("Text must be at least 10 characters")).toBeInTheDocument();
    expect(mockCreateFeature).not.toHaveBeenCalled();
  });

  it("submits successfully and redirects to /", async () => {
    const user = userEvent.setup();
    mockCreateFeature.mockResolvedValue({
      id: "1",
      text: "A valid proposal text",
      authorEmail: "test@email.com",
      upvoteCount: 0,
      createdAt: "",
    });

    const { container } = render(<CreateFeaturePage />);

    const textField = getTextArea(container);

    await user.type(textField, "A valid proposal text");
    await user.click(screen.getByRole("button", { name: /submit proposal/i }));

    expect(mockCreateFeature).toHaveBeenCalledWith({
      text: "A valid proposal text",
      authorEmail: "test@email.com",
    });
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows snackbar on API error", async () => {
    const user = userEvent.setup();
    mockCreateFeature.mockRejectedValue(new Error("Server error"));

    const { container } = render(<CreateFeaturePage />);

    const textField = getTextArea(container);

    await user.type(textField, "A valid proposal text for testing");
    await user.click(screen.getByRole("button", { name: /submit proposal/i }));

    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });

  it("calls router.back() when back button is clicked", async () => {
    const user = userEvent.setup();

    render(<CreateFeaturePage />);

    const backButton = screen.getByTestId("ArrowBackIcon").closest("button")!;
    await user.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });
});
