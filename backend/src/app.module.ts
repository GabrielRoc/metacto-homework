import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { ObservabilityModule } from './infrastructure/observability/observability.module';
import { FeatureProposalController } from './presentation/controllers/feature-proposal.controller';
import { CreateFeatureProposalUseCase } from './application/use-cases/create-feature-proposal.use-case';
import { ListFeatureProposalsUseCase } from './application/use-cases/list-feature-proposals.use-case';
import { UpvoteFeatureProposalUseCase } from './application/use-cases/upvote-feature-proposal.use-case';
import { AuthorTypeormRepository } from './infrastructure/database/typeorm/repositories/author.typeorm-repository';
import { FeatureProposalTypeormRepository } from './infrastructure/database/typeorm/repositories/feature-proposal.typeorm-repository';
import { UpvoteTypeormRepository } from './infrastructure/database/typeorm/repositories/upvote.typeorm-repository';

@Module({
  imports: [DatabaseModule, CacheModule, ObservabilityModule],
  controllers: [FeatureProposalController],
  providers: [
    CreateFeatureProposalUseCase,
    ListFeatureProposalsUseCase,
    UpvoteFeatureProposalUseCase,
    { provide: 'AUTHOR_REPOSITORY', useClass: AuthorTypeormRepository },
    { provide: 'FEATURE_PROPOSAL_REPOSITORY', useClass: FeatureProposalTypeormRepository },
    { provide: 'UPVOTE_REPOSITORY', useClass: UpvoteTypeormRepository },
  ],
})
export class AppModule {}
