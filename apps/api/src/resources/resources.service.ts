import { Injectable } from '@nestjs/common';
import { type PaginatedResponse, createPaginatedResponse } from '@starter/api';
import { type Prisma, prisma } from '@starter/db';
import type { Resource } from '@starter/db';
import { NotFoundError } from '@starter/utils';
import type { CreateResourceDto, ListResourcesDto, UpdateResourceDto } from './dto';

@Injectable()
export class ResourcesService {
  async findAll(query: ListResourcesDto): Promise<PaginatedResponse<Resource>> {
    const { page = 1, perPage = 20, search, status, sort } = query;
    const skip = (page - 1) * perPage;

    // Build where clause
    const where: Prisma.ResourceWhereInput = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (sort) {
      const fields = sort.split(',');
      for (const field of fields) {
        if (field.startsWith('-')) {
          orderBy[field.slice(1)] = 'desc';
        } else {
          orderBy[field] = 'asc';
        }
      }
    } else {
      orderBy.createdAt = 'desc';
    }

    const [items, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
      }),
      prisma.resource.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, perPage);
  }

  async findOne(id: string): Promise<Resource> {
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundError(`Resource with id ${id} not found`);
    }

    return resource;
  }

  async create(data: CreateResourceDto): Promise<Resource> {
    return prisma.resource.create({
      data,
    });
  }

  async update(id: string, data: UpdateResourceDto): Promise<Resource> {
    await this.findOne(id); // Check if exists

    return prisma.resource.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists

    await prisma.resource.delete({
      where: { id },
    });
  }
}
