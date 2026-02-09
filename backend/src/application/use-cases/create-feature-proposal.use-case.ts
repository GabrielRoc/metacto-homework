import { Inject, Injectable } from '@nestjs/common';
import type { IAuthorRepository } from '../../domain/repositories/author.repository.interface';
import type { IFeatureProposalRepository } from '../../domain/repositories/feature-proposal.repository.interface';
import { CreateFeatureProposalDto } from '../dtos/create-feature-proposal.dto';
import { RedisCacheService } from '../../infrastructure/cache/redis-cache.service';

@Injectable()
export class CreateFeatureProposalUseCase {
  constructor(
    @Inject('AUTHOR_REPOSITORY')
    private readonly authorRepository: IAuthorRepository,
    @Inject('FEATURE_PROPOSAL_REPOSITORY')
    private readonly featureProposalRepository: IFeatureProposalRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async execute(dto: CreateFeatureProposalDto) {
    const author = await this.authorRepository.findOrCreate(dto.authorEmail);

    const proposal = await this.featureProposalRepository.save({
      text: dto.text,
      authorId: author.id,
      upvoteCount: 0,
    });

    await this.cacheService.invalidatePattern('features:*');

    return {
      id: proposal.id,
      text: proposal.text,
      authorEmail: author.email,
      upvoteCount: proposal.upvoteCount,
      createdAt: proposal.createdAt.toISOString(),
    };
  }
}
