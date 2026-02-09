import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { AuthorOrmEntity } from './author.orm-entity';
import { FeatureProposalOrmEntity } from './feature-proposal.orm-entity';

@Entity('upvotes')
@Unique('idx_upvotes_author_feature', ['authorId', 'featureId'])
@Index('idx_upvotes_feature_id', ['featureId'])
export class UpvoteOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  authorId: string;

  @Column({ type: 'uuid' })
  featureId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => AuthorOrmEntity, { eager: false })
  @JoinColumn({ name: 'author_id' })
  author: AuthorOrmEntity;

  @ManyToOne(() => FeatureProposalOrmEntity, { eager: false })
  @JoinColumn({ name: 'feature_id' })
  feature: FeatureProposalOrmEntity;
}
