import { z } from 'zod';

export const ListFeatureProposalsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(10),
  sortBy: z.enum(['createdAt', 'upvoteCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListFeatureProposalsDto = z.infer<typeof ListFeatureProposalsSchema>;
