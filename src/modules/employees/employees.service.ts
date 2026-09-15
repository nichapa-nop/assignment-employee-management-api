import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import {
  EmployeeResponseDto,
  PaginatedEmployeesResponseDto,
} from './dto/employee-response.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesRepository } from './employees.repository';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeesService {
  constructor(private readonly employeesRepository: EmployeesRepository) {}

  async findAll(
    query: QueryEmployeeDto,
  ): Promise<PaginatedEmployeesResponseDto> {
    this.assertValidRanges(query);

    const [employees, total] =
      await this.employeesRepository.findAndCount(query);

    return {
      data: employees.map((employee) =>
        EmployeeResponseDto.fromEntity(employee),
      ),
      meta: PaginationMetaDto.of(query.page, query.limit, total),
    };
  }

  async findOne(id: number): Promise<EmployeeResponseDto> {
    return EmployeeResponseDto.fromEntity(await this.getEmployeeOrFail(id));
  }

  async create(dto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    const employee = this.employeesRepository.create({
      name: dto.name,
      department: dto.department,
      salary: dto.salary,
      joinDate: dto.joinDate,
      isActive: dto.isActive,
    });

    return EmployeeResponseDto.fromEntity(
      await this.employeesRepository.save(employee),
    );
  }

  /** Only fields present in the request are changed; updatedAt is stamped when something changes. */
  async update(
    id: number,
    dto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    const employee = await this.getEmployeeOrFail(id);

    const changes = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    ) as Partial<Employee>;
    Object.assign(employee, changes);

    return EmployeeResponseDto.fromEntity(
      await this.employeesRepository.save(employee),
    );
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.employeesRepository.softDelete(id);
    if (!deleted) {
      throw this.notFound(id);
    }
  }

  private async getEmployeeOrFail(id: number): Promise<Employee> {
    const employee = await this.employeesRepository.findById(id);
    if (!employee) {
      throw this.notFound(id);
    }
    return employee;
  }

  private notFound(id: number): NotFoundException {
    return new NotFoundException(`Employee with id ${id} not found`);
  }

  private assertValidRanges(query: QueryEmployeeDto): void {
    const errors: string[] = [];

    if (
      query.salaryMin !== undefined &&
      query.salaryMax !== undefined &&
      query.salaryMin > query.salaryMax
    ) {
      errors.push('salaryMin must be less than or equal to salaryMax');
    }

    if (
      query.joinDateFrom &&
      query.joinDateTo &&
      query.joinDateFrom > query.joinDateTo
    ) {
      errors.push('joinDateFrom must be on or before joinDateTo');
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }
}
