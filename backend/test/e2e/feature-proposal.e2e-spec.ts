import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CreateFeatureProposalUseCase } from '../../src/application/use-cases/create-feature-proposal.use-case';
import { ListFeatureProposalsUseCase } from '../../src/application/use-cases/list-feature-proposals.use-case';
import { UpvoteFeatureProposalUseCase } from '../../src/application/use-cases/upvote-feature-proposal.use-case';

describe('FeatureProposalController (e2e)', () => {
  let app: INestApplication;

  const mockCreateUseCase = { execute: jest.fn() };
  const mockListUseCase = { execute: jest.fn() };
  const mockUpvoteUseCase = { execute: jest.fn() };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CreateFeatureProposalUseCase)
      .useValue(mockCreateUseCase)
      .overrideProvider(ListFeatureProposalsUseCase)
      .useValue(mockListUseCase)
      .overrideProvider(UpvoteFeatureProposalUseCase)
      .useValue(mockUpvoteUseCase)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/features', () => {
    it('should return paginated features', async () => {
      const mockResponse = {
        data: [
          {
            id: 'f1',
            text: 'Test feature proposal',
            authorEmail: 'test@test.com',
            upvoteCount: 0,
            createdAt: new Date().toISOString(),
          },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockListUseCase.execute.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/api/features?page=1&limit=10')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
    });
  });

  describe('POST /api/features', () => {
    it('should create a feature proposal', async () => {
      const mockResponse = {
        id: 'f1',
        text: 'A new feature proposal for testing',
        authorEmail: 'creator@test.com',
        upvoteCount: 0,
        createdAt: new Date().toISOString(),
      };
      mockCreateUseCase.execute.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/api/features')
        .send({
          text: 'A new feature proposal for testing',
          authorEmail: 'creator@test.com',
        })
        .expect(201);

      expect(response.body).toEqual(mockResponse);
    });

    it('should return 400 for invalid body', async () => {
      await request(app.getHttpServer())
        .post('/api/features')
        .send({ text: 'short', authorEmail: 'invalid' })
        .expect(400);
    });
  });

  describe('POST /api/features/:id/upvote', () => {
    it('should upvote a feature proposal', async () => {
      const mockResponse = {
        id: 'f1',
        text: 'A feature proposal for upvoting',
        authorEmail: 'author@test.com',
        upvoteCount: 1,
        createdAt: new Date().toISOString(),
      };
      mockUpvoteUseCase.execute.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/api/features/550e8400-e29b-41d4-a716-446655440000/upvote')
        .send({ email: 'voter@test.com' })
        .expect(201);

      expect(response.body).toEqual(mockResponse);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .post('/api/features/not-a-uuid/upvote')
        .send({ email: 'voter@test.com' })
        .expect(400);
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/features/550e8400-e29b-41d4-a716-446655440000/upvote')
        .send({ email: 'invalid' })
        .expect(400);
    });
  });
});
