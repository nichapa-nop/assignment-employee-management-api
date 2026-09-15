import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { SortOrder } from '../../../common/enums/sort-order.enum';
import {
  toBoolean,
  trimString,
} from '../../../common/transformers/value.transformers';
import { IsDateOnly } from '../../../common/validators/is-date-only.decorator';
import { Department } from '../../departments/enums/department.enum';
import { EMPLOYEE_NAME_MAX_LENGTH } from '../employee.constants';
import { EmployeeSortField } from '../enums/employee-sort-field.enum';

export class QueryEmployeeDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Matches part of the name (case-insensitive) or an exact ID',
    example: 'john',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(EMPLOYEE_NAME_MAX_LENGTH)
  search?: string;

  @ApiPropertyOptional({ enum: Department })
  @IsOptional()
  @IsEnum(Department)
  department?: Department;

  @ApiPropertyOptional({ description: 'true = Active, false = Inactive' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2023-01-01' })
  @IsOptional()
  @IsDateOnly()
  joinDateFrom?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateOnly()
  joinDateTo?: string;

  @ApiPropertyOptional({ minimum: 0, example: 40000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional({ minimum: 0, example: 70000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  salaryMax?: number;

  @ApiPropertyOptional({
    enum: EmployeeSortField,
    default: EmployeeSortField.Id,
  })
  @IsOptional()
  @IsEnum(EmployeeSortField)
  sortBy: EmployeeSortField = EmployeeSortField.Id;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.Asc })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.Asc;
}
