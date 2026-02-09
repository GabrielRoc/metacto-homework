import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureProposal } from '../../../../domain/entities/feature-proposal.entity';
import { IFeatureProposalRepository } from '../../../../domain/repositories/feature-proposal.repository.interface';
import { FeatureProposalOrmEntity } from '../entities/feature-proposal.orm-entity';

@Injectable()
export class FeatureProposalTypeormRepository implements IFeatureProposalRepository {
  constructor(
    @InjectRepository(FeatureProposalOrmEntity)
    private readonly repo: Repository<FeatureProposalOrmEntity>,
  ) {}

  async findById(id: string): Promise<FeatureProposal | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['author'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findPaginated(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
  ): Promise<FeatureProposal[]> {
    const entities = await this.repo.find({
      relations: ['author'],
      order: { [sortBy]: sortOrder.toUpperCase() as 'ASC' | 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return entities.map((e) => this.toDomain(e));
  }

  async countAll(): Promise<number> {
    return this.repo.count();
  }

  async save(proposal: Partial<FeatureProposal>): Promise<FeatureProposal> {
    const entity = this.repo.create({
      text: proposal.text,
      authorId: proposal.authorId,
      upvoteCount: proposal.upvoteCount ?? 0,
    });
    const saved = await this.repo.save(entity);
    const full = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['author'],
    });
    return this.toDomain(full!);
  }

  async incrementUpvoteCount(id: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ upvoteCount: () => '"upvote_count" + 1' })
      .where('id = :id', { id })
      .execute();
  }

  private toDomain(entity: FeatureProposalOrmEntity): FeatureProposal {
    return new FeatureProposal({
      id: entity.id,
      text: entity.text,
      authorId: entity.authorId,
      upvoteCount: entity.upvoteCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      authorEmail: entity.author?.email,
    });
  }
}
