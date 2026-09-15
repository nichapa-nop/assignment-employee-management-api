import { INestApplication } from '@nestjs/common';
import { Test as TestingModuleBuilder } from '@nestjs/testing';
import request, { Test } from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { Department } from '../src/modules/departments/enums/department.enum';
import { Employee } from '../src/modules/employees/entities/employee.entity';

interface EmployeeBody {
  id: number;
  name: string;
  department: Department;
  salary: number;
  joinDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ListBody {
  data: EmployeeBody[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

const FIXTURES: Partial<Employee>[] = [
  {
    name: 'John Doe',
    department: Department.Engineering,
    salary: 65000,
    joinDate: '2023-01-15',
    isActive: true,
  },
  {
    name: 'Jane Smith',
    department: Department.Marketing,
    salary: 58000,
    joinDate: '2023-03-22',
    isActive: true,
  },
  {
    name: 'Alice Wong',
    department: Department.Sales,
    salary: 45000,
    joinDate: '2024-06-01',
    isActive: true,
  },
  {
    name: 'Bob Brown',
    department: Department.Engineering,
    salary: 72000,
    joinDate: '2022-11-10',
    isActive: false,
  },
  {
    name: 'Charlie Day',
    department: Department.HR,
    salary: 50000,
    joinDate: '2024-02-19',
    isActive: true,
  },
];

const VALID_EMPLOYEE = {
  name: 'Diana Prince',
  department: Department.Sales,
  salary: 48000.5,
  joinDate: '2027-01-01',
  isActive: true,
};

/** Asserts the status code and returns the typed JSON body. */
async function expectBody<T>(pending: Test, status: number): Promise<T> {
  const response = await pending.expect(status);
  return response.body as T;
}

const names = (list: ListBody) => list.data.map((employee) => employee.name);

describe('Employees API (e2e)', () => {
  let app: INestApplication<App>;
  let employees: Repository<Employee>;

  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    const moduleRef = await TestingModuleBuilder.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    employees = app.get(DataSource).getRepository(Employee);
  });

  beforeEach(async () => {
    await employees.query('TRUNCATE TABLE employees RESTART IDENTITY');
    // Insert one by one so IDs follow fixture order (101..105).
    for (const fixture of FIXTURES) {
      await employees.save(employees.create(fixture));
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/departments', () => {
    it('returns the department list', async () => {
      const departments = await expectBody<string[]>(
        api().get('/api/departments'),
        200,
      );

      expect(departments).toEqual(['Engineering', 'Marketing', 'Sales', 'HR']);
    });
  });

  describe('GET /api/employees', () => {
    const list = (query: object = {}) =>
      expectBody<ListBody>(api().get('/api/employees').query(query), 200);

    it('returns the first page sorted by id', async () => {
      const result = await list();

      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1,
      });
      expect(result.data.map((employee) => employee.id)).toEqual([
        101, 102, 103, 104, 105,
      ]);
      expect(result.data[0]).toEqual({
        id: 101,
        name: 'John Doe',
        department: 'Engineering',
        salary: 65000,
        joinDate: '2023-01-15',
        isActive: true,
        createdAt: expect.any(String) as string,
        updatedAt: expect.any(String) as string,
      });
    });

    it('searches by partial name, case-insensitively', async () => {
      expect(names(await list({ search: 'SMI' }))).toEqual(['Jane Smith']);
    });

    it('searches by exact id', async () => {
      expect(names(await list({ search: '103' }))).toEqual(['Alice Wong']);
    });

    it('treats LIKE wildcards in search as literal characters', async () => {
      expect((await list({ search: '%' })).meta.total).toBe(0);
    });

    it('combines department and status filters', async () => {
      const result = await list({ department: 'Engineering', isActive: false });

      expect(names(result)).toEqual(['Bob Brown']);
    });

    it('filters by inclusive salary and join date ranges', async () => {
      const result = await list({
        salaryMin: 50000,
        salaryMax: 65000,
        joinDateFrom: '2023-01-15',
        joinDateTo: '2024-12-31',
      });

      expect(names(result)).toEqual(['John Doe', 'Jane Smith', 'Charlie Day']);
    });

    it('sorts departments alphabetically and breaks ties by id', async () => {
      const result = await list({ sortBy: 'department', sortOrder: 'ASC' });

      expect(names(result)).toEqual([
        'John Doe',
        'Bob Brown',
        'Charlie Day',
        'Jane Smith',
        'Alice Wong',
      ]);
    });

    it('sorts by salary descending', async () => {
      const result = await list({ sortBy: 'salary', sortOrder: 'DESC' });

      expect(result.data.map((employee) => employee.salary)).toEqual([
        72000, 65000, 58000, 50000, 45000,
      ]);
    });

    it('sorts by id descending', async () => {
      const result = await list({ sortBy: 'id', sortOrder: 'DESC' });

      expect(result.data.map((employee) => employee.id)).toEqual([
        105, 104, 103, 102, 101,
      ]);
    });

    it('paginates results', async () => {
      const result = await list({ page: 2, limit: 2 });

      expect(result.data.map((employee) => employee.id)).toEqual([103, 104]);
      expect(result.meta).toEqual({
        page: 2,
        limit: 2,
        total: 5,
        totalPages: 3,
      });
    });

    it.each([
      [{ limit: 101 }, 'limit must not be greater than 100'],
      [{ page: 0 }, 'page must not be less than 1'],
      [{ isActive: 'maybe' }, 'isActive must be a boolean value'],
      [{ sortBy: 'password' }, 'sortBy must be one of the following values'],
      [
        { joinDateFrom: '15-01-2023' },
        'joinDateFrom must be in YYYY-MM-DD format',
      ],
      [
        { salaryMin: 10, salaryMax: 5 },
        'salaryMin must be less than or equal to salaryMax',
      ],
      [{ unknown: 'x' }, 'property unknown should not exist'],
    ])('rejects invalid query %p', async (query, message) => {
      const error = await expectBody<ErrorBody>(
        api().get('/api/employees').query(query),
        400,
      );

      expect(error.message).toEqual(
        expect.arrayContaining([expect.stringContaining(message)]),
      );
    });
  });

  describe('GET /api/employees/:id', () => {
    it('returns the employee', async () => {
      const employee = await expectBody<EmployeeBody>(
        api().get('/api/employees/104'),
        200,
      );

      expect(employee).toMatchObject({
        id: 104,
        name: 'Bob Brown',
        isActive: false,
      });
    });

    it('returns 404 in the standard error format', async () => {
      const error = await expectBody<ErrorBody>(
        api().get('/api/employees/999'),
        404,
      );

      expect(error).toEqual({
        statusCode: 404,
        error: 'Not Found',
        message: 'Employee with id 999 not found',
        path: '/api/employees/999',
        timestamp: expect.any(String) as string,
      });
    });

    it.each(['abc', '0', '99999999999'])(
      'returns 400 for invalid id "%s"',
      async (id) => {
        await api().get(`/api/employees/${id}`).expect(400);
      },
    );
  });

  describe('POST /api/employees', () => {
    it('creates an employee with a generated id and trimmed name', async () => {
      const created = await expectBody<EmployeeBody>(
        api()
          .post('/api/employees')
          .send({ ...VALID_EMPLOYEE, name: '  Diana Prince  ' }),
        201,
      );

      expect(created).toMatchObject({ ...VALID_EMPLOYEE, id: 106 });
      expect(created.createdAt).toBe(created.updatedAt);
      await api().get('/api/employees/106').expect(200);
    });

    it('rejects system-managed fields in the body', async () => {
      const error = await expectBody<ErrorBody>(
        api()
          .post('/api/employees')
          .send({ ...VALID_EMPLOYEE, id: 1, updatedAt: '2020-01-01' }),
        400,
      );

      expect(error.message).toEqual(
        expect.arrayContaining([
          'property id should not exist',
          'property updatedAt should not exist',
        ]),
      );
    });

    it.each([
      [{ name: '   ' }, 'name should not be empty'],
      [
        { name: 'x'.repeat(101) },
        'name must be shorter than or equal to 100 characters',
      ],
      [
        { department: 'Finance' },
        'department must be one of the following values',
      ],
      [{ salary: -1 }, 'salary must not be less than 0'],
      [{ salary: 1.234 }, 'salary must be a number conforming'],
      [{ salary: '5000' }, 'salary must be a number conforming'],
      [{ joinDate: '2024-02-30' }, 'joinDate must be a valid date'],
      [{ isActive: 'yes' }, 'isActive must be a boolean value'],
    ])('rejects invalid field %p', async (override, message) => {
      const error = await expectBody<ErrorBody>(
        api()
          .post('/api/employees')
          .send({ ...VALID_EMPLOYEE, ...override }),
        400,
      );

      expect(error.message).toEqual(
        expect.arrayContaining([expect.stringContaining(message)]),
      );
    });
  });

  describe('PATCH /api/employees/:id', () => {
    it('updates only the sent fields and stamps updatedAt', async () => {
      const before = await expectBody<EmployeeBody>(
        api().get('/api/employees/101'),
        200,
      );

      const updated = await expectBody<EmployeeBody>(
        api()
          .patch('/api/employees/101')
          .send({ salary: 70000.25, isActive: false }),
        200,
      );

      expect(updated).toMatchObject({
        name: 'John Doe',
        department: 'Engineering',
        salary: 70000.25,
        isActive: false,
      });
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.updatedAt).getTime(),
      );
    });

    it('rejects null for required fields', async () => {
      await api().patch('/api/employees/101').send({ name: null }).expect(400);
    });

    it('returns 404 for an unknown employee', async () => {
      await api().patch('/api/employees/999').send({ salary: 1 }).expect(404);
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('soft-deletes the employee', async () => {
      await api().delete('/api/employees/102').expect(204);

      await api().get('/api/employees/102').expect(404);
      await api().patch('/api/employees/102').send({ salary: 1 }).expect(404);

      const result = await expectBody<ListBody>(
        api().get('/api/employees'),
        200,
      );
      expect(result.meta.total).toBe(4);

      const row = await employees.findOne({
        where: { id: 102 },
        withDeleted: true,
      });
      expect(row?.deletedAt).toBeInstanceOf(Date);
    });

    it('returns 404 when deleting an already deleted employee', async () => {
      await api().delete('/api/employees/102').expect(204);
      await api().delete('/api/employees/102').expect(404);
    });

    it('returns 404 for an unknown employee', async () => {
      await api().delete('/api/employees/999').expect(404);
    });
  });
});
