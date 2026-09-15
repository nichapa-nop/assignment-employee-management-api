import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { POSTGRES_INT_MAX } from '../constants/database.constants';

export const MAX_PAGE_SIZE = 100;

export class PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, maximum: POSTGRES_INT_MAX, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  // Bounded so the computed OFFSET stays a plain integer in the generated SQL.
  @Max(POSTGRES_INT_MAX)
  page: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: MAX_PAGE_SIZE, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit: number = 10;
}
