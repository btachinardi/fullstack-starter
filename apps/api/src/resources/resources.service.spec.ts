import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesService } from './resources.service';
import { prisma } from '@starter/db';

jest.mock('@starter/db', () => ({
  prisma: {
    resource: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('ResourcesService', () => {
  let service: ResourcesService;
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourcesService],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated resources', async () => {
      const mockResources = [
        {
          id: '1',
          name: 'Resource 1',
          description: 'Test',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.resource.findMany.mockResolvedValue(mockResources);
      mockPrisma.resource.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, perPage: 20 });

      expect(result.items).toEqual(mockResources);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(20);
      expect(mockPrisma.resource.findMany).toHaveBeenCalled();
      expect(mockPrisma.resource.count).toHaveBeenCalled();
    });

    it('should filter by search query', async () => {
      mockPrisma.resource.findMany.mockResolvedValue([]);
      mockPrisma.resource.count.mockResolvedValue(0);

      await service.findAll({ page: 1, perPage: 20, search: 'test' });

      expect(mockPrisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.any(Object) }),
            ]),
          }),
        }),
      );
    });

    it('should filter by status', async () => {
      mockPrisma.resource.findMany.mockResolvedValue([]);
      mockPrisma.resource.count.mockResolvedValue(0);

      await service.findAll({ page: 1, perPage: 20, status: 'active' });

      expect(mockPrisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a resource by id', async () => {
      const mockResource = {
        id: '1',
        name: 'Test',
        description: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.resource.findUnique.mockResolvedValue(mockResource);

      const result = await service.findOne('1');

      expect(result).toEqual(mockResource);
      expect(mockPrisma.resource.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw error if resource not found', async () => {
      mockPrisma.resource.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow('Resource with id 999 not found');
    });
  });

  describe('create', () => {
    it('should create a new resource', async () => {
      const createDto = {
        name: 'New Resource',
        description: 'Description',
        status: 'active',
      };

      const mockResource = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.resource.create.mockResolvedValue(mockResource);

      const result = await service.create(createDto);

      expect(result).toEqual(mockResource);
      expect(mockPrisma.resource.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('update', () => {
    it('should update a resource', async () => {
      const updateDto = { name: 'Updated' };
      const mockResource = {
        id: '1',
        name: 'Updated',
        description: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.resource.findUnique.mockResolvedValue(mockResource);
      mockPrisma.resource.update.mockResolvedValue(mockResource);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockResource);
      expect(mockPrisma.resource.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a resource', async () => {
      const mockResource = {
        id: '1',
        name: 'Deleted',
        description: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.resource.findUnique.mockResolvedValue(mockResource);
      mockPrisma.resource.delete.mockResolvedValue(mockResource);

      await service.remove('1');

      expect(mockPrisma.resource.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
