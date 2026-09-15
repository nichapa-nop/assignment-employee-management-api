import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';

/**
 * Every field is optional, but an explicit `null` is still validated (and
 * rejected) instead of being skipped, so required columns can't be nulled.
 */
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto, {
  skipNullProperties: false,
}) {}
