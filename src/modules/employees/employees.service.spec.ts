import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Department } from '../departments/enums/department.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesRepository } from './employees.repository';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';

function buildEmployee(overrides: Partial<Employee> = {}): Employee {
  return Object.assign(new Employee(), {
    id: 101,
    name: 'John Doe',
    department: Department.Engineering,
    salary: 65000,
    joinDate: '2023-01-15',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-10T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  });
}

function buildQuery(overrides: Partial<QueryEmployeeDto> = {}) {
  return Object.assign(new QueryEmployeeDto(), overrides);
}

describe('EmployeesService', () => {
  let service: EmployeesService;
  let repository: jest.Mocked<EmployeesRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: EmployeesRepository,
          useValue: {
            findAndCount: jest.fn(),
            findById: jest.fn(),
            create: jest.fn((data: Partial<Employee>) =>
              Object.assign(new Employee(), data),
            ),
            save: jest.fn((employee: Employee) =>
              Promise.resolve(buildEmployee(employee)),
            ),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(EmployeesService);
    repository = moduleRef.get(EmployeesRepository);
  });

  describe('findAll', () => {
    it('returns mapped employees with pagination meta', async () => {
      repository.findAndCount.mockResolvedValue([[buildEmployee()], 21]);

      const result = await service.findAll(buildQuery({ page: 2, limit: 10 }));

      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 21,
        totalPages: 3,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('deletedAt');
    });

    it('rejects a salary range where min is greater than max', async () => {
      await expect(
        service.findAll(buildQuery({ salaryMin: 100, salaryMax: 50 })),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.findAndCount).not.toHaveBeenCalled();
    });

    it('rejects a join date range that ends before it starts', async () => {
      await expect(
        service.findAll(
          buildQuery({ joinDateFrom: '2024-02-01', joinDateTo: '2024-01-31' }),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('returns the employee', async () => {
      repository.findById.mockResolvedValue(buildEmployee());

      await expect(service.findOne(101)).resolves.toMatchObject({
        id: 101,
        name: 'John Doe',
      });
    });

    it('throws NotFoundException when the employee does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Employee with id 999 not found'),
      );
    });
  });

  describe('create', () => {
    it('saves only the fields defined by the DTO', async () => {
      const dto = Object.assign(new CreateEmployeeDto(), {
        name: 'Jane Smith',
        department: Department.Marketing,
        salary: 58000,
        joinDate: '2023-03-22',
        isActive: true,
      });

      await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        name: 'Jane Smith',
        department: Department.Marketing,
        salary: 58000,
        joinDate: '2023-03-22',
        isActive: true,
      });
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('changes only the fields present in the request', async () => {
      const employee = buildEmployee();
      repository.findById.mockResolvedValue(employee);
      const dto = Object.assign(new UpdateEmployeeDto(), {
        salary: 70000,
        name: undefined,
      });

      const result = await service.update(101, dto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'John Doe', salary: 70000 }),
      );
      expect(result.salary).toBe(70000);
    });

    it('can set isActive to false', async () => {
      repository.findById.mockResolvedValue(buildEmployee());

      await service.update(
        101,
        Object.assign(new UpdateEmployeeDto(), { isActive: false }),
      );

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('throws NotFoundException when the employee does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update(999, new UpdateEmployeeDto()),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('soft-deletes the employee', async () => {
      repository.softDelete.mockResolvedValue(true);

      await expect(service.remove(101)).resolves.toBeUndefined();
      expect(repository.softDelete).toHaveBeenCalledWith(101);
    });

    it('throws NotFoundException when nothing was deleted', async () => {
      repository.softDelete.mockResolvedValue(false);

      await expect(service.remove(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
