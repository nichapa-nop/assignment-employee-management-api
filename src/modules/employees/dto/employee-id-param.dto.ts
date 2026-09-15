import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { POSTGRES_INT_MAX } from '../../../common/constants/database.constants';

export class EmployeeIdParamDto {
  @ApiProperty({ example: 101 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(POSTGRES_INT_MAX)
  id: number;
}
