import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Hosted PostgreSQL such as Supabase exposes tables in the public schema
 * through an auto-generated Data API that anyone holding the public
 * (publishable) key can call. Enabling RLS without policies denies that
 * access, while the API keeps working because it connects as the table
 * owner, which RLS does not apply to. Harmless on a plain local PostgreSQL.
 */
export class EnableRowLevelSecurity1789484498557 implements MigrationInterface {
  name = 'EnableRowLevelSecurity1789484498557';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE "migrations" ENABLE ROW LEVEL SECURITY`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "migrations" DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DISABLE ROW LEVEL SECURITY`,
    );
  }
}
