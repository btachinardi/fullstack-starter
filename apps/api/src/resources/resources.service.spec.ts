import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesService } from './resources.service';
import { PrismaService } from '@starter/platform-db';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    resource: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
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

      mockPrismaService.resource.findMany.mockResolvedValue(mockResources);
      mockPrismaService.resource.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, perPage: 20 });

      expect(result.items).toEqual(mockResources);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(20);
      expect(prisma.resource.findMany).toHaveBeenCalled();
      expect(prisma.resource.count).toHaveBeenCalled();
    });

    it('should filter by search query', async () => {
      mockPrismaService.resource.findMany.mockResolvedValue([]);
      mockPrismaService.resource.count.mockResolvedValue(0);

      await service.findAll({ page: 1, perPage: 20, search: 'test' });

      expect(prisma.resource.findMany).toHaveBeenCalledWith(
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
      mockPrismaService.resource.findMany.mockResolvedValue([]);
      mockPrismaService.resource.count.mockResolvedValue(0);

      await service.findAll({ page: 1, perPage: 20, status: 'active' });

      expect(prisma.resource.findMany).toHaveBeenCalledWith(
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

      mockPrismaService.resource.findUnique.mockResolvedValue(mockResource);

      const result = await service.findOne('1');

      expect(result).toEqual(mockResource);
      expect(prisma.resource.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if resource not found', async () => {
      mockPrismaService.resource.findUnique.mockResolvedValue(null);

      const result = await service.findOne('999');

      expect(result).toBeNull();
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

      mockPrismaService.resource.create.mockResolvedValue(mockResource);

      const result = await service.create(createDto);

      expect(result).toEqual(mockResource);
      expect(prisma.resource.create).toHaveBeenCalledWith({
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

      mockPrismaService.resource.update.mockResolvedValue(mockResource);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockResource);
      expect(prisma.resource.update).toHaveBeenCalledWith({
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

      mockPrismaService.resource.delete.mockResolvedValue(mockResource);

      const result = await service.remove('1');

      expect(result).toEqual(mockResource);
      expect(prisma.resource.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
