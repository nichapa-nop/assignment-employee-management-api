import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { Department } from '../../departments/enums/department.enum';
import { Employee } from '../entities/employee.entity';

export class EmployeeResponseDto {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ enum: Department, example: Department.Engineering })
  department: Department;

  @ApiProperty({ example: 65000 })
  salary: number;

  @ApiProperty({ example: '2023-01-15', description: 'Date in YYYY-MM-DD' })
  joinDate: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-10T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    example: '2026-01-10T00:00:00.000Z',
    description: 'Last Updated Date, stamped by the system',
  })
  updatedAt: Date;

  static fromEntity(employee: Employee): EmployeeResponseDto {
    return Object.assign(new EmployeeResponseDto(), {
      id: employee.id,
      name: employee.name,
      department: employee.department,
      salary: employee.salary,
      joinDate: employee.joinDate,
      isActive: employee.isActive,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    });
  }
}

export class PaginatedEmployeesResponseDto {
  @ApiProperty({ type: [EmployeeResponseDto] })
  data: EmployeeResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
