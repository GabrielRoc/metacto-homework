import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "../page";

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn(), replace: mockReplace }),
}));

vi.mock("@/lib/api", () => ({
  fetchFeatures: vi.fn(),
  upvoteFeature: vi.fn(),
}));

import { fetchFeatures } from "@/lib/api";

const mockFetchFeatures = vi.mocked(fetchFeatures);

beforeEach(() => {
  vi.clearAllMocks();
  Storage.prototype.getItem = vi.fn((key: string) => {
    if (key === "savedEmail") return "test@test.com";
    return null;
  });
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    }))
  );
});

afterEach(() => {
  cleanup();
});

function makePaginatedResponse(features: Array<{ id: string; text: string }>) {
  return {
    data: features.map((f) => ({
      ...f,
      authorEmail: "a@b.com",
      upvoteCount: 3,
      createdAt: "2025-01-01T00:00:00Z",
    })),
    meta: { page: 1, limit: 10, total: features.length, totalPages: 1 },
  };
}

describe("HomePage", () => {
  it("loads and displays features on mount", async () => {
    mockFetchFeatures.mockResolvedValue(
      makePaginatedResponse([{ id: "1", text: "Feature one" }])
    );

    render(<HomePage />);

    expect(await screen.findByText("Feature one")).toBeInTheDocument();
  });

  it("shows empty state when no features", async () => {
    mockFetchFeatures.mockResolvedValue(makePaginatedResponse([]));

    render(<HomePage />);

    expect(await screen.findByText("No feature proposals yet")).toBeInTheDocument();
  });

  it("shows loading spinner initially", () => {
    mockFetchFeatures.mockReturnValue(new Promise(() => {}));

    render(<HomePage />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows error via snackbar on fetch failure", async () => {
    mockFetchFeatures.mockRejectedValue(new Error("Network error"));

    render(<HomePage />);

    expect(await screen.findByText("Network error")).toBeInTheDocument();
  });

  it("FAB navigates to /create", async () => {
    mockFetchFeatures.mockResolvedValue(makePaginatedResponse([]));
    const user = userEvent.setup();

    render(<HomePage />);

    await screen.findByText("No feature proposals yet");

    const fab = screen.getByTestId("AddIcon").closest("button")!;
    await user.click(fab);

    expect(mockPush).toHaveBeenCalledWith("/create");
  });
});
