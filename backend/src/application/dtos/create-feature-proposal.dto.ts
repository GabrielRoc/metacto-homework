import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateFeatureProposalSchema = z.object({
  text: z.string().min(10).max(500),
  authorEmail: z.string().email(),
});

export type CreateFeatureProposalDto = z.infer<
  typeof CreateFeatureProposalSchema
>;

export class CreateFeatureProposalBody {
  @ApiProperty({
    example: 'Add dark mode support to the dashboard',
    minLength: 10,
    maxLength: 500,
  })
  text: string;

  @ApiProperty({ example: 'user@example.com' })
  authorEmail: string;
}
