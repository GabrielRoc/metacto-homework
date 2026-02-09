import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CreateFeatureProposalUseCase } from '../../application/use-cases/create-feature-proposal.use-case';
import { ListFeatureProposalsUseCase } from '../../application/use-cases/list-feature-proposals.use-case';
import { UpvoteFeatureProposalUseCase } from '../../application/use-cases/upvote-feature-proposal.use-case';
import {
  CreateFeatureProposalSchema,
  CreateFeatureProposalBody,
} from '../../application/dtos/create-feature-proposal.dto';
import {
  UpvoteFeatureProposalSchema,
  UpvoteFeatureProposalBody,
} from '../../application/dtos/upvote-feature-proposal.dto';
import { ListFeatureProposalsSchema } from '../../application/dtos/list-feature-proposals.dto';
import type { ListFeatureProposalsDto } from '../../application/dtos/list-feature-proposals.dto';
import {
  FeatureProposalResponseDto,
  PaginatedFeatureProposalsResponseDto,
} from '../../application/dtos/feature-proposal-response.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

@ApiTags('features')
@Controller('api/features')
export class FeatureProposalController {
  constructor(
    private readonly createFeatureProposal: CreateFeatureProposalUseCase,
    private readonly listFeatureProposals: ListFeatureProposalsUseCase,
    private readonly upvoteFeatureProposal: UpvoteFeatureProposalUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List feature proposals with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'upvoteCount'],
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of feature proposals',
    type: PaginatedFeatureProposalsResponseDto,
  })
  async list(
    @Query(new ZodValidationPipe(ListFeatureProposalsSchema))
    query: ListFeatureProposalsDto,
  ) {
    return this.listFeatureProposals.execute(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new feature proposal' })
  @ApiResponse({
    status: 201,
    description: 'Feature proposal created',
    type: FeatureProposalResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body(new ZodValidationPipe(CreateFeatureProposalSchema))
    body: CreateFeatureProposalBody,
  ) {
    return this.createFeatureProposal.execute(body);
  }

  @Post(':id/upvote')
  @ApiOperation({ summary: 'Upvote a feature proposal' })
  @ApiParam({ name: 'id', type: String, description: 'Feature proposal UUID' })
  @ApiResponse({
    status: 201,
    description: 'Upvote registered',
    type: FeatureProposalResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Feature proposal not found' })
  @ApiResponse({ status: 409, description: 'Already upvoted' })
  async upvote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpvoteFeatureProposalSchema))
    body: UpvoteFeatureProposalBody,
  ) {
    return this.upvoteFeatureProposal.execute(id, body);
  }
}
