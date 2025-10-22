import { Test, TestingModule } from '@nestjs/testing';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('ResourcesController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );

    // Apply same validation pipe as production
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/resources (GET)', () => {
    it('should return paginated resources', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/resources',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('items');
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('page');
      expect(body).toHaveProperty('perPage');
      expect(body).toHaveProperty('totalPages');
      expect(Array.isArray(body.items)).toBe(true);
    });

    it('should support pagination parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/resources?page=1&perPage=10',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.page).toBe(1);
      expect(body.perPage).toBe(10);
    });

    it('should support search parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/resources?search=test',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('items');
    });

    it('should support status filter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/resources?status=active',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('items');
    });
  });

  describe('/resources (POST)', () => {
    it('should create a new resource with valid data', async () => {
      const createDto = {
        name: 'Test Resource',
        description: 'Test description',
        status: 'active',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/resources',
        payload: createDto,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body.name).toBe(createDto.name);
      expect(body.description).toBe(createDto.description);
    });

    it('should reject invalid data', async () => {
      const invalidDto = {
        // Missing required 'name' field
        description: 'Test description',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/resources',
        payload: invalidDto,
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject unknown properties when forbidNonWhitelisted is true', async () => {
      const invalidDto = {
        name: 'Test Resource',
        unknownField: 'should be rejected',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/resources',
        payload: invalidDto,
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('/resources/:id (GET)', () => {
    it('should return 404 for non-existent resource', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/resources/non-existent-id',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('/resources/:id (PUT)', () => {
    it('should return 404 when updating non-existent resource', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

      const response = await app.inject({
        method: 'PUT',
        url: '/resources/non-existent-id',
        payload: updateDto,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('/resources/:id (DELETE)', () => {
    it('should return 404 when deleting non-existent resource', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/resources/non-existent-id',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
