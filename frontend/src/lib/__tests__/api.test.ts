import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchFeatures, createFeature, upvoteFeature } from "../api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("fetchFeatures", () => {
  it("returns paginated data on success", async () => {
    const mockResponse = {
      data: [{ id: "1", text: "Feature 1", authorEmail: "a@b.com", upvoteCount: 0, createdAt: "" }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchFeatures(1, 10);
    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith("/api/features?page=1&limit=10&sortBy=createdAt&sortOrder=desc");
  });

  it("throws error on HTTP failure", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Server error" }),
    });

    await expect(fetchFeatures()).rejects.toThrow("Server error");
  });

  it("throws generic error when response has no JSON body", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error("no json")),
    });

    await expect(fetchFeatures()).rejects.toThrow("Failed to fetch features");
  });
});

describe("createFeature", () => {
  it("returns created feature on success", async () => {
    const created = { id: "1", text: "New feature", authorEmail: "a@b.com", upvoteCount: 0, createdAt: "" };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(created),
    });

    const result = await createFeature({ text: "New feature", authorEmail: "a@b.com" });
    expect(result).toEqual(created);
    expect(mockFetch).toHaveBeenCalledWith("/api/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "New feature", authorEmail: "a@b.com" }),
    });
  });

  it("throws error with message from body on HTTP failure", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Duplicate entry" }),
    });

    await expect(createFeature({ text: "x", authorEmail: "a@b.com" })).rejects.toThrow("Duplicate entry");
  });
});

describe("upvoteFeature", () => {
  it("returns updated feature on success", async () => {
    const updated = { id: "1", text: "Feature", authorEmail: "a@b.com", upvoteCount: 1, createdAt: "" };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(updated),
    });

    const result = await upvoteFeature("1", "voter@test.com");
    expect(result).toEqual(updated);
    expect(mockFetch).toHaveBeenCalledWith("/api/features/1/upvote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "voter@test.com" }),
    });
  });

  it("throws error on 409 conflict", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Already voted" }),
    });

    await expect(upvoteFeature("1", "voter@test.com")).rejects.toThrow("Already voted");
  });
});
