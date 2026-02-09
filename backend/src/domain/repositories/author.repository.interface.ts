import { Author } from '../entities/author.entity';

export interface IAuthorRepository {
  findById(id: string): Promise<Author | null>;
  findByEmail(email: string): Promise<Author | null>;
  findOrCreate(email: string): Promise<Author>;
  save(author: Partial<Author>): Promise<Author>;
}
