import { ListFeatureProposalsUseCase } from '../../../src/application/use-cases/list-feature-proposals.use-case';
import type { IFeatureProposalRepository } from '../../../src/domain/repositories/feature-proposal.repository.interface';
import type { RedisCacheService } from '../../../src/infrastructure/cache/redis-cache.service';

describe('ListFeatureProposalsUseCase', () => {
  let useCase: ListFeatureProposalsUseCase;
  let featureRepo: jest.Mocked<IFeatureProposalRepository>;
  let cacheService: jest.Mocked<RedisCacheService>;

  const now = new Date();
  const sampleProposals = [
    {
      id: 'f1',
      text: 'First feature proposal text',
      authorId: 'a1',
      upvoteCount: 5,
      createdAt: now,
      updatedAt: now,
      authorEmail: 'user1@example.com',
    },
    {
      id: 'f2',
      text: 'Second feature proposal text',
      authorId: 'a2',
      upvoteCount: 3,
      createdAt: now,
      updatedAt: now,
      authorEmail: 'user2@example.com',
    },
  ];

  beforeEach(() => {
    featureRepo = {
      findById: jest.fn(),
      findPaginated: jest.fn(),
      countAll: jest.fn(),
      save: jest.fn(),
      incrementUpvoteCount: jest.fn(),
    };

    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      invalidatePattern: jest.fn(),
    } as any;

    useCase = new ListFeatureProposalsUseCase(featureRepo, cacheService);
  });

  it('should return cached data when available', async () => {
    const cachedData = {
      data: [
        {
          id: 'f1',
          text: 'Cached proposal',
          authorEmail: 'test@test.com',
          upvoteCount: 1,
          createdAt: now.toISOString(),
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    cacheService.get.mockResolvedValue(cachedData);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    expect(result).toEqual(cachedData);
    expect(featureRepo.findPaginated).not.toHaveBeenCalled();
  });

  it('should fetch from database and cache when no cache hit', async () => {
    cacheService.get.mockResolvedValue(null);
    featureRepo.findPaginated.mockResolvedValue(sampleProposals);
    featureRepo.countAll.mockResolvedValue(2);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    expect(result.data).toHaveLength(2);
    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
    expect(cacheService.set).toHaveBeenCalledWith(
      'features:page=1:limit=10:sort=createdAt:order=desc',
      expect.any(Object),
      60,
    );
  });

  it('should calculate totalPages correctly', async () => {
    cacheService.get.mockResolvedValue(null);
    featureRepo.findPaginated.mockResolvedValue(sampleProposals);
    featureRepo.countAll.mockResolvedValue(25);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    expect(result.meta.totalPages).toBe(3);
    expect(result.meta.total).toBe(25);
  });

  it('should pass sortBy and sortOrder to repository', async () => {
    cacheService.get.mockResolvedValue(null);
    featureRepo.findPaginated.mockResolvedValue(sampleProposals);
    featureRepo.countAll.mockResolvedValue(2);

    await useCase.execute({
      page: 1,
      limit: 10,
      sortBy: 'upvoteCount',
      sortOrder: 'asc',
    });

    expect(featureRepo.findPaginated).toHaveBeenCalledWith(
      1,
      10,
      'upvoteCount',
      'asc',
    );
  });

  it('should use different cache keys for different sort params', async () => {
    cacheService.get.mockResolvedValue(null);
    featureRepo.findPaginated.mockResolvedValue(sampleProposals);
    featureRepo.countAll.mockResolvedValue(2);

    await useCase.execute({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(cacheService.get).toHaveBeenCalledWith(
      'features:page=1:limit=10:sort=createdAt:order=desc',
    );

    await useCase.execute({
      page: 1,
      limit: 10,
      sortBy: 'upvoteCount',
      sortOrder: 'asc',
    });
    expect(cacheService.get).toHaveBeenCalledWith(
      'features:page=1:limit=10:sort=upvoteCount:order=asc',
    );
  });

  it('should pass sortBy=createdAt sortOrder=desc by default pattern', async () => {
    cacheService.get.mockResolvedValue(null);
    featureRepo.findPaginated.mockResolvedValue(sampleProposals);
    featureRepo.countAll.mockResolvedValue(2);

    await useCase.execute({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    expect(featureRepo.findPaginated).toHaveBeenCalledWith(
      1,
      10,
      'createdAt',
      'desc',
    );
  });
});
