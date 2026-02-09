import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpvoteFeatureProposalSchema = z.object({
  email: z.string().email(),
});

export type UpvoteFeatureProposalDto = z.infer<typeof UpvoteFeatureProposalSchema>;

export class UpvoteFeatureProposalBody {
  @ApiProperty({ example: 'voter@example.com' })
  email: string;
}
