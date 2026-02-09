import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from '../../../../domain/entities/author.entity';
import { IAuthorRepository } from '../../../../domain/repositories/author.repository.interface';
import { AuthorOrmEntity } from '../entities/author.orm-entity';

@Injectable()
export class AuthorTypeormRepository implements IAuthorRepository {
  constructor(
    @InjectRepository(AuthorOrmEntity)
    private readonly repo: Repository<AuthorOrmEntity>,
  ) {}

  async findById(id: string): Promise<Author | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<Author | null> {
    const entity = await this.repo.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findOrCreate(email: string): Promise<Author> {
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) {
      return this.toDomain(existing);
    }
    try {
      const created = this.repo.create({ email });
      const saved = await this.repo.save(created);
      return this.toDomain(saved);
    } catch {
      // Handle race condition: another request created the author
      const retried = await this.repo.findOne({ where: { email } });
      if (retried) {
        return this.toDomain(retried);
      }
      throw new Error(`Failed to find or create author with email: ${email}`);
    }
  }

  async save(author: Partial<Author>): Promise<Author> {
    const entity = this.repo.create(author);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: AuthorOrmEntity): Author {
    return new Author({
      id: entity.id,
      email: entity.email,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
