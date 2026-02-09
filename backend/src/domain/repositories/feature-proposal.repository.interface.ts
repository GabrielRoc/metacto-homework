import { FeatureProposal } from '../entities/feature-proposal.entity';

export interface IFeatureProposalRepository {
  findById(id: string): Promise<FeatureProposal | null>;
  findPaginated(page: number, limit: number, sortBy: string, sortOrder: string): Promise<FeatureProposal[]>;
  countAll(): Promise<number>;
  save(proposal: Partial<FeatureProposal>): Promise<FeatureProposal>;
  incrementUpvoteCount(id: string): Promise<void>;
}
