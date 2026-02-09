import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import type { IAuthorRepository } from '../../domain/repositories/author.repository.interface';
import type { IFeatureProposalRepository } from '../../domain/repositories/feature-proposal.repository.interface';
import type { IUpvoteRepository } from '../../domain/repositories/upvote.repository.interface';
import { UpvoteFeatureProposalDto } from '../dtos/upvote-feature-proposal.dto';
import { RedisCacheService } from '../../infrastructure/cache/redis-cache.service';

@Injectable()
export class UpvoteFeatureProposalUseCase {
  constructor(
    @Inject('AUTHOR_REPOSITORY')
    private readonly authorRepository: IAuthorRepository,
    @Inject('FEATURE_PROPOSAL_REPOSITORY')
    private readonly featureProposalRepository: IFeatureProposalRepository,
    @Inject('UPVOTE_REPOSITORY')
    private readonly upvoteRepository: IUpvoteRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async execute(featureId: string, dto: UpvoteFeatureProposalDto) {
    const feature = await this.featureProposalRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature proposal not found');
    }

    const author = await this.authorRepository.findOrCreate(dto.email);

    const existingUpvote = await this.upvoteRepository.findByAuthorAndFeature(author.id, featureId);
    if (existingUpvote) {
      throw new ConflictException('You have already upvoted this feature');
    }

    try {
      await this.upvoteRepository.save({
        authorId: author.id,
        featureId,
      });
    } catch (error: any) {
      if (error instanceof ConflictException || error?.status === 409) {
        throw new ConflictException('You have already upvoted this feature');
      }
      throw error;
    }

    await this.featureProposalRepository.incrementUpvoteCount(featureId);

    await this.cacheService.invalidatePattern('features:*');

    const updated = await this.featureProposalRepository.findById(featureId);

    return {
      id: updated!.id,
      text: updated!.text,
      authorEmail: updated!.authorEmail ?? '',
      upvoteCount: updated!.upvoteCount,
      createdAt: updated!.createdAt.toISOString(),
    };
  }
}
