import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { POSTGRES_INT_MAX } from '../../common/constants/database.constants';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { Employee } from './entities/employee.entity';
import { EmployeeSortField } from './enums/employee-sort-field.enum';

const ALIAS = 'employee';

/**
 * Whitelisted ORDER BY expressions. Department is a PostgreSQL enum, which
 * sorts by declaration order, so it is cast to text to sort alphabetically.
 */
const SORT_EXPRESSIONS: Record<EmployeeSortField, string> = {
  [EmployeeSortField.Id]: `${ALIAS}.id`,
  [EmployeeSortField.Name]: `${ALIAS}.name`,
  [EmployeeSortField.Department]: `CAST(${ALIAS}.department AS TEXT)`,
  [EmployeeSortField.Salary]: `${ALIAS}.salary`,
  [EmployeeSortField.JoinDate]: `${ALIAS}.joinDate`,
  [EmployeeSortField.IsActive]: `${ALIAS}.isActive`,
  [EmployeeSortField.UpdatedAt]: `${ALIAS}.updatedAt`,
};

/** Escapes LIKE wildcards so user input is matched literally. */
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

function parseIdSearch(search: string): number | undefined {
  if (!/^\d+$/.test(search)) {
    return undefined;
  }
  const id = Number(search);
  return id <= POSTGRES_INT_MAX ? id : undefined;
}

@Injectable()
export class EmployeesRepository {
  constructor(
    @InjectRepository(Employee)
    private readonly repository: Repository<Employee>,
  ) {}

  /** Soft-deleted employees are excluded automatically. */
  findAndCount(query: QueryEmployeeDto): Promise<[Employee[], number]> {
    const builder = this.repository.createQueryBuilder(ALIAS);

    this.applyFilters(builder, query);

    return builder
      .orderBy(SORT_EXPRESSIONS[query.sortBy], query.sortOrder)
      .addOrderBy(`${ALIAS}.id`, 'ASC')
      .offset((query.page - 1) * query.limit)
      .limit(query.limit)
      .getManyAndCount();
  }

  findById(id: number): Promise<Employee | null> {
    return this.repository.findOneBy({ id });
  }

  create(data: Partial<Employee>): Employee {
    return this.repository.create(data);
  }

  save(employee: Employee): Promise<Employee> {
    return this.repository.save(employee);
  }

  /** Returns false when no active employee has the given ID. */
  async softDelete(id: number): Promise<boolean> {
    // softDelete does not skip rows that are already deleted, so filter explicitly.
    const result = await this.repository.softDelete({
      id,
      deletedAt: IsNull(),
    });
    return (result.affected ?? 0) > 0;
  }

  private applyFilters(
    builder: SelectQueryBuilder<Employee>,
    query: QueryEmployeeDto,
  ): void {
    if (query.search) {
      const search = query.search;
      const searchId = parseIdSearch(search);

      builder.andWhere(
        new Brackets((where) => {
          where.where(`${ALIAS}.name ILIKE :namePattern`, {
            namePattern: `%${escapeLikePattern(search)}%`,
          });
          if (searchId !== undefined) {
            where.orWhere(`${ALIAS}.id = :searchId`, { searchId });
          }
        }),
      );
    }

    if (query.department) {
      builder.andWhere(`${ALIAS}.department = :department`, {
        department: query.department,
      });
    }

    if (query.isActive !== undefined) {
      builder.andWhere(`${ALIAS}.isActive = :isActive`, {
        isActive: query.isActive,
      });
    }

    if (query.joinDateFrom) {
      builder.andWhere(`${ALIAS}.joinDate >= :joinDateFrom`, {
        joinDateFrom: query.joinDateFrom,
      });
    }

    if (query.joinDateTo) {
      builder.andWhere(`${ALIAS}.joinDate <= :joinDateTo`, {
        joinDateTo: query.joinDateTo,
      });
    }

    if (query.salaryMin !== undefined) {
      builder.andWhere(`${ALIAS}.salary >= :salaryMin`, {
        salaryMin: query.salaryMin,
      });
    }

    if (query.salaryMax !== undefined) {
      builder.andWhere(`${ALIAS}.salary <= :salaryMax`, {
        salaryMax: query.salaryMax,
      });
    }
  }
}
