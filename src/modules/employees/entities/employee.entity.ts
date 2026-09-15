import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../../../database/transformers/decimal.transformer';
import { Department } from '../../departments/enums/department.enum';

@Entity({ name: 'employees' })
@Check('CHK_employees_salary_non_negative', '"salary" >= 0')
export class Employee {
  /** Identity starting at 101 to continue the numbering of the source Excel file. */
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'BY DEFAULT',
    primaryKeyConstraintName: 'PK_employees',
  })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index('IDX_employees_department')
  @Column({ type: 'enum', enum: Department })
  department: Department;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  salary: number;

  /** Calendar date as `YYYY-MM-DD`; kept as a string so it never shifts across time zones. */
  @Column({ name: 'join_date', type: 'date' })
  joinDate: string;

  @Index('IDX_employees_is_active')
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /** "Last Updated Date" — stamped automatically on every insert and update. */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
