import { Inject, Injectable } from '@nestjs/common';
import type { IFeatureProposalRepository } from '../../domain/repositories/feature-proposal.repository.interface';
import { ListFeatureProposalsDto } from '../dtos/list-feature-proposals.dto';
import { RedisCacheService } from '../../infrastructure/cache/redis-cache.service';

@Injectable()
export class ListFeatureProposalsUseCase {
  constructor(
    @Inject('FEATURE_PROPOSAL_REPOSITORY')
    private readonly featureProposalRepository: IFeatureProposalRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async execute(dto: ListFeatureProposalsDto) {
    const cacheKey = `features:page=${dto.page}:limit=${dto.limit}:sort=${dto.sortBy}:order=${dto.sortOrder}`;

    const cached =
      await this.cacheService.get<ReturnType<typeof this.buildResponse>>(
        cacheKey,
      );
    if (cached) {
      return cached;
    }

    const [proposals, total] = await Promise.all([
      this.featureProposalRepository.findPaginated(
        dto.page,
        dto.limit,
        dto.sortBy,
        dto.sortOrder,
      ),
      this.featureProposalRepository.countAll(),
    ]);

    const response = this.buildResponse(proposals, dto.page, dto.limit, total);

    await this.cacheService.set(cacheKey, response, 60);

    return response;
  }

  private buildResponse(
    proposals: Array<{
      id: string;
      text: string;
      authorEmail?: string;
      upvoteCount: number;
      createdAt: Date;
    }>,
    page: number,
    limit: number,
    total: number,
  ) {
    return {
      data: proposals.map((p) => ({
        id: p.id,
        text: p.text,
        authorEmail: p.authorEmail ?? '',
        upvoteCount: p.upvoteCount,
        createdAt: p.createdAt.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
