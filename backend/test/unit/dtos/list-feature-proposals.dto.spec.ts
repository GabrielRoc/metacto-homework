import { ListFeatureProposalsSchema } from '../../../src/application/dtos/list-feature-proposals.dto';

describe('ListFeatureProposalsSchema', () => {
  it('should apply default values when no sort params provided', () => {
    const result = ListFeatureProposalsSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.sortBy).toBe('createdAt');
    expect(result.sortOrder).toBe('desc');
  });

  it('should accept sortBy=createdAt', () => {
    const result = ListFeatureProposalsSchema.parse({ sortBy: 'createdAt' });
    expect(result.sortBy).toBe('createdAt');
  });

  it('should accept sortBy=upvoteCount', () => {
    const result = ListFeatureProposalsSchema.parse({ sortBy: 'upvoteCount' });
    expect(result.sortBy).toBe('upvoteCount');
  });

  it('should accept sortOrder=asc', () => {
    const result = ListFeatureProposalsSchema.parse({ sortOrder: 'asc' });
    expect(result.sortOrder).toBe('asc');
  });

  it('should accept sortOrder=desc', () => {
    const result = ListFeatureProposalsSchema.parse({ sortOrder: 'desc' });
    expect(result.sortOrder).toBe('desc');
  });

  it('should reject invalid sortBy value', () => {
    const result = ListFeatureProposalsSchema.safeParse({
      sortBy: 'invalidField',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid sortOrder value', () => {
    const result = ListFeatureProposalsSchema.safeParse({
      sortOrder: 'sideways',
    });
    expect(result.success).toBe(false);
  });

  it('should accept all sort params together', () => {
    const result = ListFeatureProposalsSchema.parse({
      page: '2',
      limit: '20',
      sortBy: 'upvoteCount',
      sortOrder: 'asc',
    });
    expect(result).toEqual({
      page: 2,
      limit: 20,
      sortBy: 'upvoteCount',
      sortOrder: 'asc',
    });
  });
});
