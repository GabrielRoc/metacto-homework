import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Upvote } from '../../../../domain/entities/upvote.entity';
import { IUpvoteRepository } from '../../../../domain/repositories/upvote.repository.interface';
import { UpvoteOrmEntity } from '../entities/upvote.orm-entity';

@Injectable()
export class UpvoteTypeormRepository implements IUpvoteRepository {
  constructor(
    @InjectRepository(UpvoteOrmEntity)
    private readonly repo: Repository<UpvoteOrmEntity>,
  ) {}

  async findByAuthorAndFeature(authorId: string, featureId: string): Promise<Upvote | null> {
    const entity = await this.repo.findOne({
      where: { authorId, featureId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(upvote: Partial<Upvote>): Promise<Upvote> {
    try {
      const entity = this.repo.create({
        authorId: upvote.authorId,
        featureId: upvote.featureId,
      });
      const saved = await this.repo.save(entity);
      return this.toDomain(saved);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).code === '23505') {
        throw new ConflictException('Duplicate upvote');
      }
      throw error;
    }
  }

  private toDomain(entity: UpvoteOrmEntity): Upvote {
    return new Upvote({
      id: entity.id,
      authorId: entity.authorId,
      featureId: entity.featureId,
      createdAt: entity.createdAt,
    });
  }
}
