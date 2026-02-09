import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuthorOrmEntity } from './author.orm-entity';

@Entity('feature_proposals')
@Index('idx_feature_proposals_author_id', ['authorId'])
@Index('idx_feature_proposals_upvote_count', ['upvoteCount'])
@Index('idx_feature_proposals_created_at', ['createdAt'])
@Index('idx_feature_proposals_upvotes_created', ['upvoteCount', 'createdAt'])
export class FeatureProposalOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'uuid' })
  authorId: string;

  @Column({ type: 'integer', default: 0 })
  upvoteCount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => AuthorOrmEntity, { eager: false })
  @JoinColumn({ name: 'author_id' })
  author: AuthorOrmEntity;
}
