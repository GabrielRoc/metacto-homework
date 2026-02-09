import { Upvote } from '../entities/upvote.entity';

export interface IUpvoteRepository {
  findByAuthorAndFeature(
    authorId: string,
    featureId: string,
  ): Promise<Upvote | null>;
  save(upvote: Partial<Upvote>): Promise<Upvote>;
}
