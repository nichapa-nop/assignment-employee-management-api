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

   Adjust `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_DATABASE` to match your local PostgreSQL.

3. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run start:dev
   ```

The API runs on `http://localhost:3001/api`.

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled build |
| `npm run lint` | Lint and fix |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |

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
