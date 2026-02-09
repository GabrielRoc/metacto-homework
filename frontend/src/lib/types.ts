export interface FeatureProposal {
  id: string;
  text: string;
  authorEmail: string;
  upvoteCount: number;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse {
  data: FeatureProposal[];
  meta: PaginationMeta;
}

export interface CreateFeatureRequest {
  text: string;
  authorEmail: string;
}

export interface UpvoteRequest {
  email: string;
}
