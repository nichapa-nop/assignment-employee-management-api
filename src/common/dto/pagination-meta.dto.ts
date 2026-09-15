import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;

  static of(page: number, limit: number, total: number): PaginationMetaDto {
    return Object.assign(new PaginationMetaDto(), {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }
}
