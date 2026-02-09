import { ApiProperty } from '@nestjs/swagger';

export class FeatureProposalResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Add dark mode support to the dashboard' })
  text: string;

  @ApiProperty({ example: 'user@example.com' })
  authorEmail: string;

  @ApiProperty({ example: 5 })
  upvoteCount: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class PaginatedFeatureProposalsResponseDto {
  @ApiProperty({ type: [FeatureProposalResponseDto] })
  data: FeatureProposalResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
