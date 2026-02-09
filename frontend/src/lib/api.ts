import {
  CreateFeatureRequest,
  FeatureProposal,
  PaginatedResponse,
} from "./types";

export async function fetchFeatures(
  page: number = 1,
  limit: number = 10,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
): Promise<PaginatedResponse> {
  const res = await fetch(`/api/features?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "Failed to fetch features");
  }
  return res.json();
}

export async function createFeature(
  data: CreateFeatureRequest
): Promise<FeatureProposal> {
  const res = await fetch("/api/features", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "Failed to create feature");
  }
  return res.json();
}

export async function upvoteFeature(
  id: string,
  email: string
): Promise<FeatureProposal> {
  const res = await fetch(`/api/features/${id}/upvote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "Failed to upvote feature");
  }
  return res.json();
}
