# Employee Management API

RESTful API for managing employee records (search, filter, CRUD).

Frontend: [assignment-employee-management-web](https://github.com/nichapa-nop/assignment-employee-management-web)

## Tech stack

- NestJS 11
- TypeORM
- PostgreSQL (local installation)
- class-validator / class-transformer
- Swagger (OpenAPI)

## Prerequisites

- Node.js 22+
- PostgreSQL running locally

## Getting started

1. Create the database:

   ```sql
   CREATE DATABASE employee_management TEMPLATE template0;
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Adjust the `DB_*` values to match your local PostgreSQL. The app validates all
   variables at startup and exits with a descriptive error if any are missing or invalid.

   | Variable | Description | Example |
   |---|---|---|
   | `NODE_ENV` | `development`, `production`, or `test` | `development` |
   | `PORT` | HTTP port | `3001` |
   | `API_PREFIX` | Global route prefix | `api` |
   | `CORS_ORIGIN` | Allowed origins, comma-separated | `http://localhost:3000` |
   | `DB_HOST` | PostgreSQL host | `localhost` |
   | `DB_PORT` | PostgreSQL port | `5433` |
   | `DB_USERNAME` | PostgreSQL user | `postgres` |
   | `DB_PASSWORD` | PostgreSQL password | `postgres` |
   | `DB_DATABASE` | Database name | `employee_management` |
   | `DB_LOGGING` | Log SQL queries | `false` |

3. Install dependencies, create the schema, import the sample data, and start the dev server:

   ```bash
   npm install
   npm run db:setup
   npm run start:dev
   ```

   `db:setup` runs the migrations and then seeds employees from
   `src/database/seeds/data/employees.xlsx` (sheet "Example Data"). The seed is
   idempotent: re-running it restores the original rows without duplicates.

- API: `http://localhost:3001/api`
- Swagger docs: `http://localhost:3001/api/docs`

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled build |
| `npm run lint` | Lint and fix |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run migration:generate -- src/database/migrations/<Name>` | Generate a migration from entity changes |
| `npm run migration:create -- src/database/migrations/<Name>` | Create an empty migration |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:revert` | Revert the last migration |
| `npm run migration:show` | List migrations and their status |
| `npm run migration:run:prod` | Apply migrations using the compiled build |
| `npm run migration:check` | Fail if entities and the database schema differ |
| `npm run seed` | Import employees from the Excel file |
| `npm run db:setup` | Run migrations, then seed |

## Data model

`employees`

| Column | Type | Notes |
|---|---|---|
| `id` | `integer` identity | Auto-generated, starts at 101 |
| `name` | `varchar(100)` | Required |
| `department` | enum | `Engineering`, `Marketing`, `Sales`, `HR` |
| `salary` | `numeric(12,2)` | `CHECK (salary >= 0)` |
| `join_date` | `date` | Returned as `YYYY-MM-DD` to avoid time zone shifts |
| `is_active` | `boolean` | Default `true` |
| `created_at` | `timestamptz` | Auto |
| `updated_at` | `timestamptz` | "Last Updated Date", stamped on every write |
| `deleted_at` | `timestamptz` | Soft delete marker |

## Error response format

Every error returns the same shape:

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Employee with id 999 not found",
  "path": "/api/employees/999",
  "timestamp": "2026-09-15T10:00:00.000Z"
}
```

`message` is an array of strings for validation errors.

## Project structure

```
src/
├── config/                 # environment configuration
├── common/                 # shared DTOs, filters, interceptors, constants
├── database/               # migrations, seeds
└── modules/
    ├── employees/          # dto/, entities/, controller, service, module
    └── departments/        # dto/, entities/, controller, service, module
```
