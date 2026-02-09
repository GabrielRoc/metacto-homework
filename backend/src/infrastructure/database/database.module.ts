import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuthorOrmEntity } from './typeorm/entities/author.orm-entity';
import { FeatureProposalOrmEntity } from './typeorm/entities/feature-proposal.orm-entity';
import { UpvoteOrmEntity } from './typeorm/entities/upvote.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'app',
      password: process.env.DB_PASSWORD || 'app123',
      database: process.env.DB_NAME || 'features',
      entities: [AuthorOrmEntity, FeatureProposalOrmEntity, UpvoteOrmEntity],
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    TypeOrmModule.forFeature([
      AuthorOrmEntity,
      FeatureProposalOrmEntity,
      UpvoteOrmEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
