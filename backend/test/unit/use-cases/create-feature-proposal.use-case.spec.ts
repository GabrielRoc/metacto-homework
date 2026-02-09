import { CreateFeatureProposalUseCase } from '../../../src/application/use-cases/create-feature-proposal.use-case';
import type { IAuthorRepository } from '../../../src/domain/repositories/author.repository.interface';
import type { IFeatureProposalRepository } from '../../../src/domain/repositories/feature-proposal.repository.interface';
import type { RedisCacheService } from '../../../src/infrastructure/cache/redis-cache.service';

describe('CreateFeatureProposalUseCase', () => {
  let useCase: CreateFeatureProposalUseCase;
  let authorRepo: jest.Mocked<IAuthorRepository>;
  let featureRepo: jest.Mocked<IFeatureProposalRepository>;
  let cacheService: jest.Mocked<RedisCacheService>;

  beforeEach(() => {
    authorRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findOrCreate: jest.fn(),
      save: jest.fn(),
    };

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

    useCase = new CreateFeatureProposalUseCase(
      authorRepo,
      featureRepo,
      cacheService,
    );
  });

  it('should create a feature proposal and return the response', async () => {
    const now = new Date();
    authorRepo.findOrCreate.mockResolvedValue({
      id: 'author-1',
      email: 'test@example.com',
      createdAt: now,
      updatedAt: now,
    });

    featureRepo.save.mockResolvedValue({
      id: 'feature-1',
      text: 'A great feature idea for testing',
      authorId: 'author-1',
      upvoteCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    const result = await useCase.execute({
      text: 'A great feature idea for testing',
      authorEmail: 'test@example.com',
    });

    expect(result).toEqual({
      id: 'feature-1',
      text: 'A great feature idea for testing',
      authorEmail: 'test@example.com',
      upvoteCount: 0,
      createdAt: now.toISOString(),
    });

    expect(authorRepo.findOrCreate).toHaveBeenCalledWith('test@example.com');
    expect(featureRepo.save).toHaveBeenCalledWith({
      text: 'A great feature idea for testing',
      authorId: 'author-1',
      upvoteCount: 0,
    });
    expect(cacheService.invalidatePattern).toHaveBeenCalledWith('features:*');
  });

  it('should reuse an existing author', async () => {
    const now = new Date();
    authorRepo.findOrCreate.mockResolvedValue({
      id: 'existing-author',
      email: 'existing@example.com',
      createdAt: now,
      updatedAt: now,
    });

    featureRepo.save.mockResolvedValue({
      id: 'feature-2',
      text: 'Another great feature proposal',
      authorId: 'existing-author',
      upvoteCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    const result = await useCase.execute({
      text: 'Another great feature proposal',
      authorEmail: 'existing@example.com',
    });

    expect(result.authorEmail).toBe('existing@example.com');
    expect(authorRepo.findOrCreate).toHaveBeenCalledWith(
      'existing@example.com',
    );
  });
});
