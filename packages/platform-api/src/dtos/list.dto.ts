import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto, PaginatedResponse } from './pagination.dto';

/**
 * Base List Query DTO following PRD-04 List Endpoint contract
 */
export class ListQueryDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Filter by status' })
  status?: string;
}

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  perPage: number
): PaginatedResponse<T> {
  return {
    items,
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
    meta: {
      queryId: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
    },
  };
}
