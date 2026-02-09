import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeatureCard from "../FeatureCard";
import { FeatureProposal } from "@/lib/types";

afterEach(() => {
  cleanup();
});

function makeFeature(overrides: Partial<FeatureProposal> = {}): FeatureProposal {
  return {
    id: "feat-1",
    text: "Add dark mode support",
    authorEmail: "author@test.com",
    upvoteCount: 5,
    createdAt: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("FeatureCard", () => {
  it("renders feature text, email, and vote count", () => {
    render(<FeatureCard feature={makeFeature()} onUpvote={() => {}} />);

    expect(screen.getByText("Add dark mode support")).toBeInTheDocument();
    expect(screen.getByText("by author@test.com")).toBeInTheDocument();
    expect(screen.getByText("5 votes")).toBeInTheDocument();
  });

  it('shows "1 vote" for singular', () => {
    render(<FeatureCard feature={makeFeature({ upvoteCount: 1 })} onUpvote={() => {}} />);
    expect(screen.getByText("1 vote")).toBeInTheDocument();
  });

  it('shows "2 votes" for plural', () => {
    render(<FeatureCard feature={makeFeature({ upvoteCount: 2 })} onUpvote={() => {}} />);
    expect(screen.getByText("2 votes")).toBeInTheDocument();
  });

  it("calls onUpvote with feature id when Upvote button is clicked", async () => {
    const onUpvote = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <FeatureCard feature={makeFeature({ id: "abc-123" })} onUpvote={onUpvote} />
    );

    const button = within(container).getByRole("button", { name: /upvote/i });
    await user.click(button);
    expect(onUpvote).toHaveBeenCalledWith("abc-123");
  });
});
