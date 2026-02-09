import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpvoteFeatureProposalUseCase } from '../../../src/application/use-cases/upvote-feature-proposal.use-case';
import type { IAuthorRepository } from '../../../src/domain/repositories/author.repository.interface';
import type { IFeatureProposalRepository } from '../../../src/domain/repositories/feature-proposal.repository.interface';
import type { IUpvoteRepository } from '../../../src/domain/repositories/upvote.repository.interface';
import type { RedisCacheService } from '../../../src/infrastructure/cache/redis-cache.service';

describe('UpvoteFeatureProposalUseCase', () => {
  let useCase: UpvoteFeatureProposalUseCase;
  let authorRepo: jest.Mocked<IAuthorRepository>;
  let featureRepo: jest.Mocked<IFeatureProposalRepository>;
  let upvoteRepo: jest.Mocked<IUpvoteRepository>;
  let cacheService: jest.Mocked<RedisCacheService>;

  const now = new Date();

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

    upvoteRepo = {
      findByAuthorAndFeature: jest.fn(),
      save: jest.fn(),
    };

    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      invalidatePattern: jest.fn(),
    } as any;

    useCase = new UpvoteFeatureProposalUseCase(authorRepo, featureRepo, upvoteRepo, cacheService);
  });

  it('should upvote a feature proposal successfully', async () => {
    featureRepo.findById
      .mockResolvedValueOnce({
        id: 'f1',
        text: 'A proposal for testing upvotes',
        authorId: 'a1',
        upvoteCount: 0,
        createdAt: now,
        updatedAt: now,
        authorEmail: 'author@example.com',
      })
      .mockResolvedValueOnce({
        id: 'f1',
        text: 'A proposal for testing upvotes',
        authorId: 'a1',
        upvoteCount: 1,
        createdAt: now,
        updatedAt: now,
        authorEmail: 'author@example.com',
      });

    authorRepo.findOrCreate.mockResolvedValue({
      id: 'voter-1',
      email: 'voter@example.com',
      createdAt: now,
      updatedAt: now,
    });

    upvoteRepo.findByAuthorAndFeature.mockResolvedValue(null);
    upvoteRepo.save.mockResolvedValue({
      id: 'upvote-1',
      authorId: 'voter-1',
      featureId: 'f1',
      createdAt: now,
    });

    const result = await useCase.execute('f1', { email: 'voter@example.com' });

    expect(result.upvoteCount).toBe(1);
    expect(featureRepo.incrementUpvoteCount).toHaveBeenCalledWith('f1');
    expect(cacheService.invalidatePattern).toHaveBeenCalledWith('features:*');
  });

  it('should throw NotFoundException when feature does not exist', async () => {
    featureRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent-id', { email: 'voter@example.com' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException when already upvoted', async () => {
    featureRepo.findById.mockResolvedValue({
      id: 'f1',
      text: 'A proposal for testing upvotes',
      authorId: 'a1',
      upvoteCount: 1,
      createdAt: now,
      updatedAt: now,
    });

    authorRepo.findOrCreate.mockResolvedValue({
      id: 'voter-1',
      email: 'voter@example.com',
      createdAt: now,
      updatedAt: now,
    });

    upvoteRepo.findByAuthorAndFeature.mockResolvedValue({
      id: 'existing-upvote',
      authorId: 'voter-1',
      featureId: 'f1',
      createdAt: now,
    });

    await expect(
      useCase.execute('f1', { email: 'voter@example.com' }),
    ).rejects.toThrow(ConflictException);
  });
});
